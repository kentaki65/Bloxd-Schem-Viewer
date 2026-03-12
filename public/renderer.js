// renderer.js
import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";
let blocksJson = {};
(async () => blocksJson = await fetch("./blockMetadata.json").then(r => r.json()))();

const textureCache = {};
const loader = new THREE.TextureLoader();

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

export function draw(data) {
  structure.clear();

  const { blocks } = data;
  const { minX, minY, minZ, sizeX, sizeY, sizeZ } = getBounds(blocks);

  const centerX = minX + sizeX / 2;
  const centerZ = minZ + sizeZ / 2;
  const baseY = minY;

  structure.add(new THREE.AxesHelper(20));

  const textureCache = {};
  function getTexture(name) {
    if (Array.isArray(name)) {
      name = name[0];
    }

    if (!textureCache[name]) {
      try {
        textureCache[name] = new THREE.TextureLoader().load(`./textures/${name}.png`);
      } catch (e) {
        console.log(`./textures/${name}.png couldn't load`);
      }
    }
    return textureCache[name];
  }
  const groups = {};
  for (const b of blocks) {
    const key = b.id ?? b[String(id)];
    const texName = blocksJson[key].textureInfo; // blocksJson は JSON データ
    if (!groups[texName]) groups[texName] = [];
    groups[texName].push(b);
  }

  for (const [texName, blks] of Object.entries(groups)) {
    const mat = new THREE.MeshBasicMaterial({ map: getTexture(texName) });
    const mesh = new THREE.InstancedMesh(geometry, mat, blks.length);

    const matrix = new THREE.Matrix4();
    blks.forEach((b, i) => {
      const x = b.x - centerX + 0.5;
      const y = b.y - baseY + 0.5;
      const z = b.z - centerZ + 0.5;

      matrix.setPosition(x, y, z);
      mesh.setMatrixAt(i, matrix);
    });

    structure.add(mesh);
  }
}

const axesScene = new THREE.Scene();
const axesCamera = new THREE.PerspectiveCamera(
  50,
  1,
  0.1,
  10
);
axesCamera.position.set(2,2,2);
axesCamera.lookAt(0,0,0);
const axesHelper = new THREE.AxesHelper(1.5);

axesScene.add(axesHelper);
window.addEventListener("keydown", (e) => {
  const step = Math.PI / 16;
  if (e.key === "x") {
    structure.rotation.x += step;
  }
  if (e.key === "y") {
    structure.rotation.y += step;
  }
  if (e.key === "z") {
    structure.rotation.z += step;
  }
});

// render loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();

  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);

  renderer.autoClear = false;
  renderer.clearDepth();

  renderer.setViewport(10, window.innerHeight - 110, 100, 100);
  renderer.render(axesScene, axesCamera);
}
animate();