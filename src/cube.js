import * as THREE from 'three';

function createCube(a) {
  const geometry = new THREE.BoxGeometry(a, a, a);
  const material = new THREE.MeshPhongMaterial({color: 0x44aa88});
  const cube = new THREE.Mesh( geometry, material );
  return cube;
}


function rotateCube(cube){
    cube.rotation.x += 0.01;
	  cube.rotation.y += 0.01;
}


export {createCube,rotateCube};
