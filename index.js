import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118.1/build/three.module.js';

import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/controls/OrbitControls.js';

import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';

let camera, scene, renderer;

const clock = new THREE.Clock();

const humanObjects = [];
const circleObjects = [];
const mixers = [];

const checkDistance = () => {
  // Menghitung jarak antar objek dengan objek lainnya
  Object.keys(humanObjects).forEach(name => {
    Object.keys(humanObjects).forEach(name2 => {
      if(name != name2){
        let distance = Math.sqrt(Math.pow(humanObjects[name].position.x - humanObjects[name2].position.x, 2) + Math.pow(humanObjects[name].position.z - humanObjects[name2].position.z, 2));
        // console.log(distance);
        if(distance < 1){
          circleObjects[name].material.color.setHex(0xff0000);
          circleObjects[name2].material.color.setHex(0xff0000);
        }
        else{
          circleObjects[name].material.color.setHex(0x55efc4);
          circleObjects[name2].material.color.setHex(0x55efc4);
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

  const onProgress = function ( xhr ) {

    if ( xhr.lengthComputable ) {

      const percentComplete = xhr.loaded / xhr.total * 100;
      console.log( Math.round( percentComplete, 2 ) + '% downloaded' );

    }

  };

  // Membuat objek circle area
  const createCircle = (name, color, x, z) => {
    let geometry = new THREE.CircleGeometry( 1, 32 );
    let material = new THREE.MeshBasicMaterial( { color: color } );
    material.opacity = 0.5;
    material.transparent = true;
    let circle = new THREE.Mesh( geometry, material );
    circle.castShadow = false;
    circle.receiveShadow = false;
    scene.add( circle );

    circle.position.x = x;
    circle.position.y = 0.21;
    circle.position.z = z;
    circle.rotation.x = Math.PI / -2;

    circleObjects[name] = circle;
  }

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
      object.rotation.y = 0;
      object.position.x = -0.5;
      object.position.y = 0.2;
      humanObjects[name] = object;
      scene.add( humanObjects[name] );

      createCircle(name, 0x55efc4, object.position.x, object.position.z);
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
      object.position.z = 1.8;
      object.position.y = 0.2;
      humanObjects[name] = object;
      scene.add( humanObjects[name] );

      createCircle(name, 0x55efc4, object.position.x, object.position.z);
    } 
  );

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

  if (humanObjects['nathan']) {
    circleObjects['nathan'].position.z = humanObjects['nathan'].position.z += 0.006;
  }

  if (humanObjects['nathan2']) {
    circleObjects['nathan2'].position.x = humanObjects['nathan2'].position.x += 0.006;
  }

  renderer.render( scene, camera );
  
}

function render() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}