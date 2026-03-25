import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

// Create a 3D scene (like a virtual stage)
const scene = new THREE.Scene();

// Create a cube shape
const geometry = new THREE.BoxGeometry(100, 100, 100);

// Add material (green color)
const material = new THREE.MeshBasicMaterial({ color: 0xF5F5F5 });

// Combine shape and color into a mesh
const cube = new THREE.Mesh(geometry, material);

// Add the cube to the scene
scene.add(cube);

const camera = new THREE.PerspectiveCamera(
  75, // Field of view
  window.innerWidth / window.innerHeight, // Aspect ratio
  0.1, // Near clipping plane
  1000 // Far clipping plane
);

// Move the camera back so we can see the cube
camera.position.z = 500;

const renderer = new THREE.WebGLRenderer({ alpha: true }); // Transparent background
renderer.setSize(window.innerWidth, window.innerHeight);

// Add renderer's canvas to the webpage
const canvas = document.getElementById("container3D");
canvas.appendChild(renderer.domElement);

import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

// Add interactive camera controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth motion

// Update animation loop
const animate = function () {
  requestAnimationFrame(animate);

  // Keep rotating the cube
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  controls.update(); // Apply damping
  renderer.render(scene, camera);
};

animate();
