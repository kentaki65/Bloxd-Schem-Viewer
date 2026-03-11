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

const axes = new THREE.AxesHelper(20);
scene.add(axes);

const grid = new THREE.GridHelper(50, 50);
scene.add(grid);

export function draw(blocks){
  for (const b of blocks) {

    const cube = new THREE.Mesh(geometry, material);

    cube.position.set(
      b.x,
      b.y,
      b.z
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