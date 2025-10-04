import * as THREE from "three";

function toSceneCoordinates(x, y, width, height) {
  return {
    x: x - width / 2,
    y: height / 2 - y,
  };
}

function createGradientTexture(topColor, bottomColor) {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, size);
  gradient.addColorStop(0, topColor);
  gradient.addColorStop(1, bottomColor);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(1, 1);
  return texture;
}

function createBirdMesh() {
  const group = new THREE.Group();

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd65c,
    emissive: 0x995522,
    roughness: 0.35,
    metalness: 0.1,
  });
  const bellyMaterial = new THREE.MeshStandardMaterial({
    color: 0xfff3b0,
    roughness: 0.6,
  });
  const accentMaterial = new THREE.MeshStandardMaterial({
    color: 0xffa33e,
    emissive: 0x331100,
    roughness: 0.45,
  });

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(12, 32, 32),
    bodyMaterial
  );
  body.castShadow = true;
  group.add(body);

  const belly = new THREE.Mesh(
    new THREE.SphereGeometry(10, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.8),
    bellyMaterial
  );
  belly.position.set(0, -1, 6);
  group.add(belly);

  const beak = new THREE.Mesh(
    new THREE.ConeGeometry(5, 12, 16),
    accentMaterial
  );
  beak.rotation.x = Math.PI / 2;
  beak.position.set(12, -2, 0);
  group.add(beak);

  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const pupilMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });

  const eye = new THREE.Mesh(new THREE.SphereGeometry(3.5, 16, 16), eyeMaterial);
  eye.position.set(6, 3, 8);
  group.add(eye);

  const pupil = new THREE.Mesh(new THREE.SphereGeometry(1.6, 12, 12), pupilMaterial);
  pupil.position.set(8.5, 3, 9.5);
  group.add(pupil);

  const wingGeometry = new THREE.BoxGeometry(16, 6, 10);
  const wingLeft = new THREE.Mesh(wingGeometry, accentMaterial);
  wingLeft.position.set(-2, 0, -8);
  wingLeft.rotation.y = Math.PI / 9;
  wingLeft.castShadow = true;
  const wingRight = wingLeft.clone();
  wingRight.position.z = 8;
  wingRight.rotation.y = -Math.PI / 9;
  group.add(wingLeft, wingRight);

  const tail = new THREE.Mesh(new THREE.ConeGeometry(5, 10, 16), accentMaterial);
  tail.rotation.x = -Math.PI / 2.4;
  tail.position.set(-10, -3, 0);
  group.add(tail);

  group.userData.wings = { left: wingLeft, right: wingRight };
  group.userData.pulse = 0;

  return group;
}

function createPipeMaterial() {
  return new THREE.MeshStandardMaterial({
    color: 0x5dbb63,
    emissive: 0x1f4c2f,
    roughness: 0.5,
  });
}

function createPipeGroup() {
  const material = createPipeMaterial();
  const top = new THREE.Mesh(new THREE.BoxGeometry(60, 200, 60), material);
  const bottom = new THREE.Mesh(new THREE.BoxGeometry(60, 200, 60), material);
  top.castShadow = bottom.castShadow = true;

  const rimMaterial = new THREE.MeshStandardMaterial({
    color: 0x8ce172,
    emissive: 0x224c18,
    roughness: 0.4,
  });
  const rimTop = new THREE.Mesh(new THREE.BoxGeometry(70, 20, 70), rimMaterial);
  const rimBottom = rimTop.clone();

  const group = new THREE.Group();
  group.add(top, bottom, rimTop, rimBottom);
  group.userData = { top, bottom, rimTop, rimBottom };

  return group;
}

function updatePipeGroup(group, pipe, playfieldHeight) {
  const { top, bottom, rimTop, rimBottom } = group.userData;
  const safeHeight = playfieldHeight;
  const topHeight = pipe.topHeight;
  const bottomHeight = safeHeight - (pipe.topHeight + pipe.gapSize);

  top.scale.y = topHeight / 200;
  bottom.scale.y = bottomHeight / 200;

  top.position.set(0, safeHeight / 2 - topHeight / 2, 0);
  bottom.position.set(0, -safeHeight / 2 + bottomHeight / 2, 0);

  const rimOffset = 10;
  rimTop.position.set(0, safeHeight / 2 - topHeight - rimOffset, 0);
  rimBottom.position.set(0, -safeHeight / 2 + bottomHeight + rimOffset, 0);
}

function createCloud() {
  const geometry = new THREE.SphereGeometry(20, 16, 16);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
  });
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

function createCloudLayer() {
  const group = new THREE.Group();
  for (let i = 0; i < 6; i += 1) {
    const cloud = createCloud();
    cloud.scale.setScalar(0.6 + Math.random() * 0.8);
    cloud.position.set(Math.random() * 800 - 400, Math.random() * 200 + 120, -80);
    group.add(cloud);
  }
  return group;
}

function createGroundPlane() {
  const geometry = new THREE.PlaneGeometry(1200, 400, 1, 1);
  const texture = createGradientTexture("#5fb45d", "#3f7a3e");
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.set(6, 1);
  const material = new THREE.MeshLambertMaterial({ map: texture });
  material.map.offset.x = 0;
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(0, -160, 0);
  mesh.receiveShadow = true;
  return mesh;
}

export function createThreeRenderer(canvas, _options = {}) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = false;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9ad7ff);
  scene.fog = new THREE.Fog(0x9ad7ff, 300, 900);

  const camera = new THREE.PerspectiveCamera(55, 1, 1, 2000);
  camera.position.set(0, 0, 620);

  const hemisphere = new THREE.HemisphereLight(0xdfefff, 0x4a8f52, 1.1);
  scene.add(hemisphere);

  const directional = new THREE.DirectionalLight(0xffffff, 0.8);
  directional.position.set(400, 500, 500);
  directional.castShadow = false;
  scene.add(directional);

  const backgroundTexture = createGradientTexture("#bce9ff", "#88c8ff");
  const backdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(1600, 1400, 1, 1),
    new THREE.MeshBasicMaterial({ map: backgroundTexture, depthWrite: false })
  );
  backdrop.material.map.needsUpdate = true;
  backdrop.position.set(0, 100, -400);
  scene.add(backdrop);

  const cloudLayer = createCloudLayer();
  scene.add(cloudLayer);

  const ground = createGroundPlane();
  ground.material.map.needsUpdate = true;
  scene.add(ground);

  const birdMesh = createBirdMesh();
  scene.add(birdMesh);

  const pipeGroups = new Map();
  let gameOverPulse = 0;

  const resizeRenderer = () => {
    const parent = canvas.parentElement;
    const clientWidth = parent?.clientWidth || canvas.clientWidth || 1;
    const clientHeight = parent?.clientHeight || canvas.clientHeight || 1;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
  };

  resizeRenderer();
  window.addEventListener("resize", resizeRenderer);

  function syncPipes(gameState) {
    const next = new Set();
    for (const pipe of gameState.pipes) {
      let entry = pipeGroups.get(pipe);
      if (!entry) {
        entry = createPipeGroup();
        pipeGroups.set(pipe, entry);
        scene.add(entry);
      }
      next.add(pipe);
      const coords = toSceneCoordinates(
        pipe.x + pipe.width / 2,
        gameState.playfieldHeight / 2,
        gameState.playfieldWidth,
        gameState.playfieldHeight
      );
      entry.position.set(coords.x, coords.y, 0);
      updatePipeGroup(entry, pipe, gameState.playfieldHeight);
    }

    for (const [pipe, group] of pipeGroups.entries()) {
      if (!next.has(pipe)) {
        scene.remove(group);
        pipeGroups.delete(pipe);
      }
    }
  }

  let wingClock = 0;

  function animateBird(gameState, deltaMs) {
    if (!gameState.bird) return;
    const { bird, playfieldWidth, playfieldHeight } = gameState;
    const centerX = bird.x + bird.width / 2;
    const centerY = bird.y + bird.height / 2;
    const coords = toSceneCoordinates(centerX, centerY, playfieldWidth, playfieldHeight);
    birdMesh.position.set(coords.x, coords.y, 0);

    const targetRotation = -bird.rotation;
    birdMesh.rotation.z += (targetRotation - birdMesh.rotation.z) * 0.15;

    if (birdMesh.userData.pulse > 0) {
      birdMesh.userData.pulse = Math.max(0, birdMesh.userData.pulse - deltaMs / 260);
      const scale = 1 + Math.sin((birdMesh.userData.pulse / 0.26) * Math.PI) * 0.08;
      birdMesh.scale.setScalar(scale);
    } else {
      birdMesh.scale.setScalar(1);
    }

    wingClock += deltaMs;
    const wingSwing = Math.sin(wingClock / 120) * 0.5 + bird.rotation * 0.4;
    const wings = birdMesh.userData.wings;
    if (wings) {
      wings.left.rotation.z = Math.PI / 2 + wingSwing;
      wings.right.rotation.z = -Math.PI / 2 - wingSwing;
    }
  }

  function animateBackground(deltaMs, speed) {
    const drift = (deltaMs / 1000) * (0.2 + speed * 0.05);
    backdrop.material.map.offset.y = (backdrop.material.map.offset.y + drift * 0.15) % 1;
    ground.material.map.offset.x = (ground.material.map.offset.x - drift) % 1;
    cloudLayer.position.x -= drift * 120;
    if (cloudLayer.position.x < -400) {
      cloudLayer.position.x = 0;
    }
    cloudLayer.rotation.z += drift * 0.01;
  }

  function render(gameState, deltaMs) {
    resizeRenderer();
    syncPipes(gameState);
    animateBird(gameState, deltaMs);
    animateBackground(deltaMs, gameState.pipeSpeed);

    if (gameOverPulse > 0) {
      const fade = Math.max(0, 1 - gameOverPulse / 600);
      scene.fog.color.lerp(new THREE.Color(0xffdede), 0.02);
      gameOverPulse -= deltaMs;
      renderer.toneMappingExposure = 1 + fade * 0.3;
    } else {
      renderer.toneMappingExposure += (1 - renderer.toneMappingExposure) * 0.1;
      scene.fog.color.lerp(new THREE.Color(0x9ad7ff), 0.05);
    }

    renderer.render(scene, camera);
  }

  function pulseBird() {
    birdMesh.userData.pulse = 0.26;
  }

  function markGameOver() {
    gameOverPulse = 600;
  }

  function dispose() {
    window.removeEventListener("resize", resizeRenderer);
    renderer.dispose();
    scene.traverse((child) => {
      if (child.isMesh) {
        child.geometry?.dispose?.();
        child.material?.dispose?.();
      }
    });
    pipeGroups.clear();
  }

  return {
    render,
    pulseBird,
    markGameOver,
    dispose,
  };
}
