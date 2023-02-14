import * as THREE from 'three';
import {createCube,rotateCube} from './cube';
import {createLight,moveLight} from './lighting';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); 

const renderer = new THREE.WebGLRenderer(); 
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

camera.position.z = 8;

const box = createCube(2);
const light = createLight();

scene.add( box );
scene.add(light);


function animate() {
	requestAnimationFrame( animate );

	rotateCube(box);
	moveLight(light);

	renderer.render( scene, camera );
};

animate();