// Game Constants
const canvas = document.getElementById("gameCanvas");
const renderer = new THREE.WebGLRenderer({ canvas });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  canvas.width / canvas.height,
  0.1,
  1000
);
const clock = new THREE.Clock();

// Bird Variables
let bird;
let birdVelocity = 0;

// Load 3D Models
const loader = new THREE.GLTFLoader();
loader.load("path_to_bird_model.glb", (gltf) => {
  bird = gltf.scene;
  bird.scale.set(0.01, 0.01, 0.01);
  bird.position.set(0, 0, 0);
  scene.add(bird);
});

// Set up Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, 1, 1).normalize();
scene.add(directionalLight);

// Game Loop
function gameLoop() {
  const deltaTime = clock.getDelta();

  // Bird Movement
  if (bird) {
    birdVelocity += 0.5 * deltaTime;
    bird.position.y -= birdVelocity;
    bird.rotation.z = Math.sin(Date.now() * 0.001) * 0.1;
  }

  // Camera Movement
  camera.position.x = 0;
  camera.position.y = bird ? bird.position.y + 10 : 0;
  camera.position.z = 20;
  camera.lookAt(0, bird ? bird.position.y : 0, 0);

  // Render the Scene
  renderer.render(scene, camera);

  requestAnimationFrame(gameLoop);
}

// Function to handle window resizing
function handleWindowResize() {
  const { width, height } = canvas.getBoundingClientRect();
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

// Handle window resize event
window.addEventListener("resize", handleWindowResize);

// Start the Game Loop
handleWindowResize();
gameLoop();
