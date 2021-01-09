import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118.1/build/three.module.js';

import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/controls/OrbitControls.js';

import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';

let camera, scene, renderer;

const clock = new THREE.Clock();

const humanObjects = [];
const ringObjects = [];
const torusObjects = [];
const mixers = [];

let diamondTop, diamondBottom;
const diamondPosition = {};

// Membuat objek circle area
const createCircleRadius = (name, color, x, z) => {
  let geometry = new THREE.RingGeometry( 0.43, 0.88, 32 );
  const ringMaterial = new THREE.MeshBasicMaterial( { color: color, side: THREE.DoubleSide  } );
  ringMaterial.opacity = 0.4;
  ringMaterial.transparent = true;

  const ring = new THREE.Mesh( geometry, ringMaterial );
  scene.add( ring );

  geometry = new THREE.TorusGeometry( 1, 0.05, 16, 100 );
  const torusMaterial = new THREE.MeshBasicMaterial( { color: color } );
  torusMaterial.opacity = 0.9;
  torusMaterial.transparent = true;
  const torus = new THREE.Mesh( geometry, torusMaterial );
  scene.add( torus );

  torus.position.x = ring.position.x = x;
  torus.position.y = ring.position.y = 0.21;
  torus.position.z = ring.position.z = z;
  torus.rotation.x = ring.rotation.x = Math.PI / -2;

  ringObjects[name] = ring;
  torusObjects[name] = torus;
}

const moveHumanObject = (name, x, y, z) => {
  if (humanObjects[name]) {
    torusObjects[name].position.x = ringObjects[name].position.x = humanObjects[name].position.x += x;
    torusObjects[name].position.y = ringObjects[name].position.y = humanObjects[name].position.y += y;
    torusObjects[name].position.z = ringObjects[name].position.z = humanObjects[name].position.z += z;
  }
}

const checkDistance = () => {
  // Menghitung jarak antar objek dengan objek lainnya
  Object.keys(humanObjects).forEach(name => {
    Object.keys(humanObjects).forEach(name2 => {
      if(name != name2){
        let distance = Math.sqrt(Math.pow(humanObjects[name].position.x - humanObjects[name2].position.x, 2) + Math.pow(humanObjects[name].position.z - humanObjects[name2].position.z, 2));
        // console.log(distance);
        if (distance < 1) {
          ringObjects[name].material.color.setHex(0xff0000);
          ringObjects[name2].material.color.setHex(0xff0000);
          
          torusObjects[name].material.color.setHex(0xff0000);
          torusObjects[name2].material.color.setHex(0xff0000);
        }
        else {
          ringObjects[name].material.color.setHex(0x5be305);
          ringObjects[name2].material.color.setHex(0x5be305);
          
          torusObjects[name].material.color.setHex(0x5be305);
          torusObjects[name2].material.color.setHex(0x5be305);
        }
      }
    });
  });
}

init();
animate();


function init() {

  const container = document.createElement( 'div' );
  document.body.appendChild( container );

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
  camera.position.x = 5;
  camera.position.z = 15;
  camera.position.y = 10;

  // scene

  scene = new THREE.Scene();

  const ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
  scene.add( ambientLight );

  const pointLight = new THREE.PointLight( 0xffffff, 0.8 );
  camera.add( pointLight );
  scene.add( camera );

  // model
  const loader = new FBXLoader();
  loader.load( 'models/fbx/office/office.fbx', function ( object ) {

      object.traverse( function ( child ) {

        if ( child.isMesh ) {
          child.castShadow = true;
          child.receiveShadow = true;
        }

      } );
      object.scale.set(0.01, 0.01, 0.01);
      scene.add(object)
    } 
  );

  loader.load( 'models/fbx/human/rp_nathan_animated_003_walking.fbx', function ( object ) {
      let name = 'nathan';
      mixers[name] = new THREE.AnimationMixer( object );

      const action = mixers[name].clipAction( object.animations[ 0 ] );
      action.play();

      object.traverse( function ( child ) {

        if ( child.isMesh ) {
          child.castShadow = true;
          child.receiveShadow = true;
        }

      } );
      object.scale.set(0.008, 0.008, 0.008);
      object.position.x = -0.5;
      object.position.y = 0.2;
      humanObjects[name] = object;
      scene.add( humanObjects[name] );

      createCircleRadius(name, 0x5be305, object.position.x, object.position.z);
    } 
  );
  
  loader.load( 'models/fbx/human/rp_nathan_animated_003_walking.fbx', function ( object ) {
      let name = 'nathan2';
      mixers[name] = new THREE.AnimationMixer( object );

      const action = mixers[name].clipAction( object.animations[ 0 ] );
      action.play();

      object.traverse( function ( child ) {

        if ( child.isMesh ) {
          child.castShadow = true;
          child.receiveShadow = true;
        }

      } );
      object.scale.set(0.008, 0.008, 0.008);
      object.rotation.y = Math.PI / 2;

      object.position.x = -2;
      object.position.y = 0.2;
      object.position.z = 1.8;
      humanObjects[name] = object;
      scene.add( humanObjects[name] );

      createCircleRadius(name, 0x5be305, object.position.x, object.position.z);
    } 
  );

  diamondPosition.x = -0.5;
  diamondPosition.z = 0;

  const geometry = new THREE.ConeGeometry( 0.1, 0.2, 4 );
  const material = new THREE.MeshBasicMaterial( {color: 0x2479d5} );
  diamondTop = new THREE.Mesh( geometry, material );
  diamondTop.position.x = diamondPosition.x;
  diamondTop.position.y = 2.2;
  diamondTop.position.z = diamondPosition.z;
  diamondTop.visible = false;
  scene.add(diamondTop);

  diamondBottom = new THREE.Mesh( geometry, material );
  diamondBottom.position.x = diamondPosition.x;
  diamondBottom.position.y = 2;
  diamondBottom.position.z = diamondPosition.z;
  diamondBottom.rotation.z = Math.PI;
  diamondBottom.visible = false;
  scene.add(diamondBottom);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  const controls = new OrbitControls( camera, renderer.domElement );
  controls.target.set( 0, 0, 0 );
  controls.update();

  window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

  requestAnimationFrame( animate );

  const delta = clock.getDelta();

  Object.values(mixers).forEach(mixer => {
    mixer.update( delta );
  });

  checkDistance();

  moveHumanObject('nathan', 0, 0, 0.006);
  moveHumanObject('nathan2', 0.006, 0, 0);

  renderer.render( scene, camera );
  
}

function render() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}