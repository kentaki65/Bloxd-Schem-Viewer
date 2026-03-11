// renderer.js
import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(40, 40, 40);

const renderer = new THREE.WebGLRenderer({ antialias: true });
const viewer = document.getElementById("view");

renderer.setSize(window.innerWidth, window.innerHeight);
viewer.appendChild(renderer.domElement);


// controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();


// lights
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1);
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff, 0.4));


// helpers
const axes = new THREE.AxesHelper(20);
scene.add(axes);

const grid = new THREE.GridHelper(50, 50);
scene.add(grid);


// shared geometry/material
const geometry = new THREE.BoxGeometry(1.001, 1.001, 1.001);

const material = new THREE.MeshStandardMaterial({
  color: 0xcccccc
});


// ブロック格納用
const structure = new THREE.Group();
scene.add(structure);


function getBounds(blocks) {

  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

  for (const b of blocks) {

    if (b.x < minX) minX = b.x;
    if (b.y < minY) minY = b.y;
    if (b.z < minZ) minZ = b.z;

    if (b.x > maxX) maxX = b.x;
    if (b.y > maxY) maxY = b.y;
    if (b.z > maxZ) maxZ = b.z;
  }

  const sizeX = maxX - minX + 1;
  const sizeY = maxY - minY + 1;
  const sizeZ = maxZ - minZ + 1;

  return { minX, minY, minZ, sizeX, sizeY, sizeZ };
}


export function draw(blocks){
  structure.clear();
  const {minX, minY, minZ, sizeX, sizeY, sizeZ} = getBounds(blocks);

  const centerX = minX + sizeX / 2;
  const centerY = minY + sizeY / 2;
  const centerZ = minZ + sizeZ / 2;

  for (const b of blocks) {

    const cube = new THREE.Mesh(geometry, material);
    const x = b.x - centerX + 0.5;
    const y = b.y - centerY + 0.5;
    const z = b.z - centerZ + 0.5;

    cube.position.set(
      z,
      y,
      -x
    );
    structure.add(cube);
  }
}


// render loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();