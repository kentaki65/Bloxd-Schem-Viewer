// renderer.js
import * as THREE from "three";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(40,40,40);
camera.lookAt(0,0,0);

const renderer = new THREE.WebGLRenderer();
const viewer = document.getElementById("view");

renderer.setSize(window.innerWidth, window.innerHeight);
viewer.appendChild(renderer.domElement);


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
  renderer.render(scene, camera);
}

animate();