import math
import os
from dataclasses import dataclass
from typing import List, Tuple

import numpy as np
from PIL import Image, ImageDraw
from pygltflib import (
    Accessor,
    Animation,
    AnimationChannel,
    AnimationChannelTarget,
    AnimationSampler,
    Asset,
    Buffer,
    BufferView,
    GLTF2,
    Image as GLTFImage,
    Material,
    Mesh,
    Node,
    PbrMetallicRoughness,
    Primitive,
    Sampler,
    Scene,
    Skin,
    Texture,
    TextureInfo,
)
import trimesh

OUTPUT_MODEL_PATH = os.path.join('public', 'assets', 'models', 'bird.glb')
OUTPUT_TEXTURE_PATH = os.path.join('public', 'assets', 'textures', 'bird_atlas.png')

COMPONENT_UNSIGNED_BYTE = 5121
COMPONENT_UNSIGNED_INT = 5125
COMPONENT_FLOAT = 5126

TYPE_SCALAR = 'SCALAR'
TYPE_VEC2 = 'VEC2'
TYPE_VEC3 = 'VEC3'
TYPE_VEC4 = 'VEC4'
TYPE_MAT4 = 'MAT4'

np.set_printoptions(suppress=True)


@dataclass
class MeshPart:
    vertices: np.ndarray
    faces: np.ndarray
    uvs: np.ndarray
    joint_index: int


ATLAS_REGIONS = {
    'body': ((0.00, 0.00), (0.50, 0.60)),
    'head': ((0.00, 0.60), (0.40, 1.00)),
    'beak': ((0.40, 0.60), (0.60, 0.90)),
    'tail': ((0.60, 0.60), (0.80, 0.90)),
    'wing_left': ((0.50, 0.00), (1.00, 0.50)),
    'wing_right': ((0.50, 0.50), (1.00, 1.00)),
}


def spherical_uv(vertices: np.ndarray, center: np.ndarray, region_key: str) -> np.ndarray:
    region_min, region_max = ATLAS_REGIONS[region_key]
    diff = vertices - center
    x, y, z = diff[:, 0], diff[:, 1], diff[:, 2]
    u = (np.arctan2(z, x) / (2.0 * math.pi)) + 0.5
    v = (y / np.linalg.norm(diff, axis=1).max()) * 0.5 + 0.5
    uv = np.stack([u, v], axis=1)
    region_min = np.array(region_min)
    region_max = np.array(region_max)
    return region_min + uv * (region_max - region_min)


def planar_uv(vertices: np.ndarray, axis0: int, axis1: int, region_key: str) -> np.ndarray:
    region_min, region_max = ATLAS_REGIONS[region_key]
    coords = vertices[:, [axis0, axis1]]
    min_vals = coords.min(axis=0)
    max_vals = coords.max(axis=0)
    # Avoid zero ranges
    size = np.where(max_vals - min_vals < 1e-5, 1.0, max_vals - min_vals)
    normalized = (coords - min_vals) / size
    region_min = np.array(region_min)
    region_max = np.array(region_max)
    return region_min + normalized * (region_max - region_min)


def create_body() -> MeshPart:
    mesh = trimesh.creation.icosphere(subdivisions=2, radius=0.18)
    mesh.apply_translation((0.0, 0.05, 0.0))
    uvs = spherical_uv(mesh.vertices, np.array([0.0, 0.05, 0.0]), 'body')
    return MeshPart(mesh.vertices, mesh.faces, uvs, 0)


def create_head() -> MeshPart:
    mesh = trimesh.creation.icosphere(subdivisions=1, radius=0.11)
    mesh.apply_translation((0.0, 0.24, 0.12))
    uvs = spherical_uv(mesh.vertices, np.array([0.0, 0.24, 0.12]), 'head')
    return MeshPart(mesh.vertices, mesh.faces, uvs, 0)


def create_beak() -> MeshPart:
    mesh = trimesh.creation.cone(radius=0.05, height=0.16, sections=24)
    mesh.apply_translation((0.0, 0.18, 0.24))
    uvs = planar_uv(mesh.vertices, 0, 2, 'beak')
    return MeshPart(mesh.vertices, mesh.faces, uvs, 0)


def create_tail() -> MeshPart:
    mesh = trimesh.creation.cone(radius=0.12, height=0.18, sections=18)
    mesh.apply_translation((0.0, 0.02, -0.22))
    mesh.apply_transform(trimesh.transformations.rotation_matrix(math.pi, (0, 1, 0)))
    uvs = planar_uv(mesh.vertices, 0, 2, 'tail')
    return MeshPart(mesh.vertices, mesh.faces, uvs, 0)


def create_wing(side: str) -> MeshPart:
    assert side in {'L', 'R'}
    span_steps = 9
    chord_steps = 5
    span = np.linspace(0.0, 0.42, span_steps)
    chord = np.linspace(0.0, 0.22, chord_steps)
    vertices = []
    faces: List[Tuple[int, int, int]] = []

    base_x = -0.14 if side == 'L' else 0.14
    sign = -1.0 if side == 'L' else 1.0
    index_map = np.zeros((span_steps, chord_steps), dtype=int)
    idx = 0

    for i, sx in enumerate(span):
        for j, cz in enumerate(chord):
            x = base_x + sign * sx
            y = 0.08 + 0.04 * math.cos((sx / span[-1]) * math.pi * 0.5) - 0.03 * (j / (chord_steps - 1))
            z = 0.02 + (0.18 - cz)
            vertices.append((x, y, z))
            index_map[i, j] = idx
            idx += 1

    for i in range(span_steps - 1):
        for j in range(chord_steps - 1):
            a = index_map[i, j]
            b = index_map[i + 1, j]
            c = index_map[i + 1, j + 1]
            d = index_map[i, j + 1]
            faces.append((a, b, d))
            faces.append((b, c, d))

    vertices_np = np.array(vertices)
    faces_np = np.array(faces)
    region_key = 'wing_left' if side == 'L' else 'wing_right'
    uvs = planar_uv(vertices_np, 0, 2, region_key)
    joint_index = 1 if side == 'L' else 2
    return MeshPart(vertices_np, faces_np, uvs, joint_index)


def combine_parts(parts: List[MeshPart]) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    vertices = []
    faces = []
    uvs = []
    joints = []
    weights = []
    vertex_offset = 0

    for part in parts:
        vertices.append(part.vertices)
        faces.append(part.faces + vertex_offset)
        uvs.append(part.uvs)
        joint_indices = np.full((part.vertices.shape[0], 4), 0, dtype=np.uint8)
        joint_indices[:, 0] = part.joint_index
        joints.append(joint_indices)
        weight_values = np.zeros((part.vertices.shape[0], 4), dtype=np.float32)
        weight_values[:, 0] = 1.0
        weights.append(weight_values)
        vertex_offset += part.vertices.shape[0]

    return (
        np.concatenate(vertices, axis=0),
        np.concatenate(faces, axis=0),
        np.concatenate(uvs, axis=0),
        np.concatenate(joints, axis=0),
        np.concatenate(weights, axis=0),
    )


def compute_vertex_normals(vertices: np.ndarray, faces: np.ndarray) -> np.ndarray:
    normals = np.zeros_like(vertices, dtype=np.float32)
    for tri in faces:
        i0, i1, i2 = tri
        v0, v1, v2 = vertices[i0], vertices[i1], vertices[i2]
        edge1 = v1 - v0
        edge2 = v2 - v0
        face_normal = np.cross(edge1, edge2)
        normals[i0] += face_normal
        normals[i1] += face_normal
        normals[i2] += face_normal

    lengths = np.linalg.norm(normals, axis=1)
    lengths[lengths == 0.0] = 1.0
    normals /= lengths[:, np.newaxis]
    return normals.astype(np.float32)


def ensure_dir(path: str) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)


def write_texture(path: str) -> bytes:
    size = 512
    image = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    # Background fill for readability
    draw.rectangle((0, 0, size, size), fill=(240, 248, 255, 255))

    def rect(region_key: str, color: Tuple[int, int, int]) -> None:
        (u0, v0), (u1, v1) = ATLAS_REGIONS[region_key]
        x0 = int(u0 * size)
        y0 = int((1.0 - v1) * size)
        x1 = int(u1 * size)
        y1 = int((1.0 - v0) * size)
        draw.rectangle((x0, y0, x1, y1), fill=(*color, 255))

    rect('body', (248, 214, 86))
    rect('head', (255, 238, 140))
    rect('beak', (230, 138, 0))
    rect('tail', (220, 198, 120))
    rect('wing_left', (251, 223, 120))
    rect('wing_right', (251, 223, 120))

    # Add simple feather pattern to wings
    for region_key in ('wing_left', 'wing_right'):
        (u0, v0), (u1, v1) = ATLAS_REGIONS[region_key]
        x0 = int(u0 * size)
        x1 = int(u1 * size)
        y0 = int((1.0 - v1) * size)
        y1 = int((1.0 - v0) * size)
        stripe_color = (225, 188, 78, 255)
        stripes = 5
        for i in range(stripes):
            t = i / stripes
            y = y0 + int((y1 - y0) * t)
            draw.line((x0, y, x1, y + 8), fill=stripe_color, width=6)

    ensure_dir(path)
    image.save(path, format='PNG')
    with open(path, 'rb') as f:
        return f.read()


def create_inverse_bind_matrices(joint_transforms: List[np.ndarray]) -> np.ndarray:
    inv_mats = [np.linalg.inv(mat) for mat in joint_transforms]
    return np.array(inv_mats, dtype=np.float32)


def matrix_from_trs(translation: Tuple[float, float, float], rotation: Tuple[float, float, float, float], scale=(1.0, 1.0, 1.0)) -> np.ndarray:
    tx, ty, tz = translation
    qx, qy, qz, qw = rotation
    sx, sy, sz = scale
    # Convert quaternion to rotation matrix
    x2, y2, z2 = qx + qx, qy + qy, qz + qz
    xx, yy, zz = qx * x2, qy * y2, qz * z2
    xy, yz, zx = qx * y2, qy * z2, qz * x2
    wx, wy, wz = qw * x2, qw * y2, qw * z2

    rot = np.array([
        [1.0 - (yy + zz), xy - wz, zx + wy, 0.0],
        [xy + wz, 1.0 - (xx + zz), yz - wx, 0.0],
        [zx - wy, yz + wx, 1.0 - (xx + yy), 0.0],
        [0.0, 0.0, 0.0, 1.0],
    ])

    scale_mat = np.diag([sx, sy, sz, 1.0])
    transform = rot @ scale_mat
    transform[:3, 3] = [tx, ty, tz]
    return transform


def pack_accessor(gltf: GLTF2, buffer_data: bytearray, array: np.ndarray, component_type: int, accessor_type: str) -> int:
    if array.dtype != np.float32 and component_type not in (COMPONENT_UNSIGNED_BYTE, COMPONENT_UNSIGNED_INT):
        array = array.astype(np.float32)

    if component_type == COMPONENT_UNSIGNED_BYTE:
        array_bytes = array.astype(np.uint8).tobytes()
    elif component_type == COMPONENT_UNSIGNED_INT:
        array_bytes = array.astype(np.uint32).tobytes()
    else:
        array_bytes = array.astype(np.float32).tobytes()

    # Align to 4 bytes
    padding = (4 - (len(buffer_data) % 4)) % 4
    if padding:
        buffer_data.extend(b"\x00" * padding)

    byte_offset = len(buffer_data)
    buffer_data.extend(array_bytes)

    buffer_view = BufferView(buffer=0, byteOffset=byte_offset, byteLength=len(array_bytes))
    buffer_view_index = len(gltf.bufferViews)
    gltf.bufferViews.append(buffer_view)

    if array.ndim == 1:
        count = array.shape[0]
    else:
        count = array.shape[0]

    accessor = Accessor(
        bufferView=buffer_view_index,
        componentType=component_type,
        count=count,
        type=accessor_type,
    )

    # Compute min/max for position and animation attributes
    if accessor_type == TYPE_VEC3 and component_type != COMPONENT_UNSIGNED_BYTE:
        accessor.min = array.min(axis=0).tolist()
        accessor.max = array.max(axis=0).tolist()
    elif accessor_type == TYPE_SCALAR:
        accessor.min = [float(array.min())]
        accessor.max = [float(array.max())]

    accessor_index = len(gltf.accessors)
    gltf.accessors.append(accessor)
    return accessor_index


def create_animation(gltf: GLTF2, buffer_data: bytearray) -> Animation:
    duration = 1.0
    frame_rate = 12.0
    frame_count = int(duration * frame_rate) + 1
    times = np.linspace(0.0, duration, frame_count, dtype=np.float32)

    amplitude = math.radians(38.0)
    angles = np.sin(times * math.tau) * amplitude

    def quat(axis: Tuple[float, float, float], angle: float) -> Tuple[float, float, float, float]:
        ax, ay, az = axis
        half = angle * 0.5
        s = math.sin(half)
        return (ax * s, ay * s, az * s, math.cos(half))

    left_quats = np.array([quat((0.0, 0.0, 1.0), angle) for angle in angles], dtype=np.float32)
    right_quats = np.array([quat((0.0, 0.0, 1.0), -angle) for angle in angles], dtype=np.float32)

    time_accessor = pack_accessor(gltf, buffer_data, times, COMPONENT_FLOAT, TYPE_SCALAR)
    left_accessor = pack_accessor(gltf, buffer_data, left_quats, COMPONENT_FLOAT, TYPE_VEC4)
    right_accessor = pack_accessor(gltf, buffer_data, right_quats, COMPONENT_FLOAT, TYPE_VEC4)

    sampler_left = AnimationSampler(input=time_accessor, output=left_accessor, interpolation='LINEAR')
    sampler_right = AnimationSampler(input=time_accessor, output=right_accessor, interpolation='LINEAR')

    animation = Animation(name='Flap', samplers=[sampler_left, sampler_right], channels=[])

    animation.channels.append(
        AnimationChannel(
            sampler=0,
            target=AnimationChannelTarget(node=1, path='rotation'),
        )
    )
    animation.channels.append(
        AnimationChannel(
            sampler=1,
            target=AnimationChannelTarget(node=2, path='rotation'),
        )
    )

    return animation


def build_gltf(vertices: np.ndarray, faces: np.ndarray, normals: np.ndarray, uvs: np.ndarray, joints: np.ndarray, weights: np.ndarray, texture_bytes: bytes) -> GLTF2:
    gltf = GLTF2()
    buffer_data = bytearray()

    indices = faces.reshape(-1).astype(np.uint32)
    position_accessor = pack_accessor(gltf, buffer_data, vertices.astype(np.float32), COMPONENT_FLOAT, TYPE_VEC3)
    normal_accessor = pack_accessor(gltf, buffer_data, normals.astype(np.float32), COMPONENT_FLOAT, TYPE_VEC3)
    uv_accessor = pack_accessor(gltf, buffer_data, uvs.astype(np.float32), COMPONENT_FLOAT, TYPE_VEC2)
    joint_accessor = pack_accessor(gltf, buffer_data, joints.astype(np.uint8), COMPONENT_UNSIGNED_BYTE, TYPE_VEC4)
    weight_accessor = pack_accessor(gltf, buffer_data, weights.astype(np.float32), COMPONENT_FLOAT, TYPE_VEC4)
    index_accessor = pack_accessor(gltf, buffer_data, indices, COMPONENT_UNSIGNED_INT, TYPE_SCALAR)

    primitive = Primitive(
        attributes={
            'POSITION': position_accessor,
            'NORMAL': normal_accessor,
            'TEXCOORD_0': uv_accessor,
            'JOINTS_0': joint_accessor,
            'WEIGHTS_0': weight_accessor,
        },
        indices=index_accessor,
        material=0,
    )

    material = Material(
        name='BirdAtlas',
        doubleSided=True,
        pbrMetallicRoughness=PbrMetallicRoughness(
            baseColorTexture=TextureInfo(index=0),
            metallicFactor=0.0,
            roughnessFactor=0.6,
        ),
    )

    mesh = Mesh(primitives=[primitive], name='Bird')

    # Buffer for texture
    padding = (4 - (len(buffer_data) % 4)) % 4
    if padding:
        buffer_data.extend(b"\x00" * padding)
    tex_offset = len(buffer_data)
    buffer_data.extend(texture_bytes)

    image_view = BufferView(buffer=0, byteOffset=tex_offset, byteLength=len(texture_bytes))
    image_view_index = len(gltf.bufferViews)
    gltf.bufferViews.append(image_view)

    texture_image = GLTFImage(bufferView=image_view_index, mimeType='image/png', name='BirdAtlas')
    sampler = Sampler(minFilter=9729, magFilter=9729, wrapS=10497, wrapT=10497)
    texture = Texture(source=0, sampler=0, name='BirdAtlasTexture')

    joints_trs = [
        matrix_from_trs((0.0, 0.0, 0.0), (0.0, 0.0, 0.0, 1.0)),
        matrix_from_trs((-0.14, 0.08, 0.0), (0.0, 0.0, 0.0, 1.0)),
        matrix_from_trs((0.14, 0.08, 0.0), (0.0, 0.0, 0.0, 1.0)),
    ]

    inverse_bind_matrices = create_inverse_bind_matrices(joints_trs)
    ibm_accessor = pack_accessor(
        gltf,
        buffer_data,
        inverse_bind_matrices,
        COMPONENT_FLOAT,
        TYPE_MAT4,
    )

    skin = Skin(
        name='BirdRig',
        inverseBindMatrices=ibm_accessor,
        joints=[0, 1, 2],
        skeleton=0,
    )

    root_node = Node(name='BirdRoot', children=[1, 2, 3])
    wing_left_node = Node(name='Wing.L', translation=[-0.14, 0.08, 0.0])
    wing_right_node = Node(name='Wing.R', translation=[0.14, 0.08, 0.0])
    mesh_node = Node(mesh=0, skin=0, name='BirdMesh')

    gltf.nodes = [root_node, wing_left_node, wing_right_node, mesh_node]

    scene = Scene(nodes=[0])
    gltf.scenes = [scene]
    gltf.scene = 0

    gltf.meshes = [mesh]
    gltf.skins = [skin]
    gltf.materials = [material]
    gltf.textures = [texture]
    gltf.images = [texture_image]
    gltf.samplers = [sampler]

    animation = create_animation(gltf, buffer_data)
    gltf.animations = [animation]

    buffer = Buffer(byteLength=len(buffer_data))
    gltf.buffers = [buffer]
    gltf.set_binary_blob(bytes(buffer_data))

    gltf.asset = Asset(generator='tools/generate_bird_assets.py', version='2.0')

    return gltf


def main() -> None:
    parts = [
        create_body(),
        create_head(),
        create_beak(),
        create_tail(),
        create_wing('L'),
        create_wing('R'),
    ]

    vertices, faces, uvs, joints, weights = combine_parts(parts)
    normals = compute_vertex_normals(vertices, faces)
    texture_bytes = write_texture(OUTPUT_TEXTURE_PATH)
    gltf = build_gltf(vertices, faces, normals, uvs, joints, weights, texture_bytes)

    ensure_dir(OUTPUT_MODEL_PATH)
    gltf.save(OUTPUT_MODEL_PATH)

    mesh = trimesh.Trimesh(vertices=vertices, faces=faces, process=False)
    print(f'Triangle count: {len(mesh.faces)}')
    print(f'Vertex count: {len(mesh.vertices)}')
    print(f'GLB size: {os.path.getsize(OUTPUT_MODEL_PATH)} bytes')


if __name__ == '__main__':
    main()
