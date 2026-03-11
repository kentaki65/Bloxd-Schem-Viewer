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

camera.position.set(40,40,40);

const renderer = new THREE.WebGLRenderer();
const viewer = document.getElementById("view");

renderer.setSize(window.innerWidth, window.innerHeight);
viewer.appendChild(renderer.domElement);


// マウス操作
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0,0,0);
controls.update();


// ライト
const light = new THREE.DirectionalLight(0xffffff,1);
light.position.set(1,1,1);

scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff,0.4));


// 共有ジオメトリ
const geometry = new THREE.BoxGeometry(1,1,1);

// 共有マテリアル
const material = new THREE.MeshStandardMaterial({
  color: 0xcccccc
});


export function draw(blocks, sizeX, sizeY, sizeZ){
  const offsetX = sizeX / 2;
  const offsetY = sizeY / 2;
  const offsetZ = sizeZ / 2;
  for (const b of blocks) {
    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(
      b.x - offsetX,
      b.y - offsetY,
      -(b.z - offsetZ)
    );
    scene.add(cube);
  }
}


// render loop
function animate(){
  requestAnimationFrame(animate);
  controls.update(); // ←これ重要
  renderer.render(scene, camera);
}

animate();