import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118.1/build/three.module.js';

import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/controls/OrbitControls.js';

import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';

let camera, scene, renderer, controls;

const clock = new THREE.Clock();

const humanObjects = [];
const ringObjects = [];
const torusObjects = [];
const mixers = {};
const profiles = {};
const animations = {};

let diamondTop, diamondBottom;
let humanObjectFollowed;

const loadHuman = (loader, path, name) => {
  loader.load(path, function (object) {
    mixers[name] = new THREE.AnimationMixer(object);

    const action = mixers[name].clipAction(object.animations[0]);
    action.play();

    object.traverse(function (child) {

      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }

    });
    object.scale.set(0.008, 0.008, 0.008);
    object.position.x = coordinates[name].x;
    object.position.y = coordinates[name].y;
    humanObjects[name] = object;
    humanObjects[name].alert = false;
    humanObjects[name].counter = 0;
    scene.add(humanObjects[name]);

    createCircleRadius(name, 0x5be305, object.position.x, object.position.z);
  }
  );
}

// Membuat objek circle area
const createCircleRadius = (name, color, x, z) => {
  let geometry = new THREE.RingGeometry(0.43, 0.88, 32);
  const ringMaterial = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
  ringMaterial.opacity = 0.4;
  ringMaterial.transparent = true;

  const ring = new THREE.Mesh(geometry, ringMaterial);
  scene.add(ring);

  geometry = new THREE.TorusGeometry(1, 0.05, 16, 100);
  const torusMaterial = new THREE.MeshBasicMaterial({ color: color });
  torusMaterial.opacity = 0.9;
  torusMaterial.transparent = true;
  const torus = new THREE.Mesh(geometry, torusMaterial);
  scene.add(torus);

  torus.position.x = ring.position.x = x;
  torus.position.y = ring.position.y = 0.21;
  torus.position.z = ring.position.z = z;
  torus.rotation.x = ring.rotation.x = Math.PI / -2;

  ringObjects[name] = ring;
  torusObjects[name] = torus;
}

const moveHumanToTarget = (name, x, z, speed) => {
  if (humanObjects[name]) {
    let objectDirection = Math.atan2(z - humanObjects[name].position.z, x - humanObjects[name].position.x)
    let delta_x = speed * Math.cos(objectDirection);
    let delta_z = speed * Math.sin(objectDirection);
    let isArriveX = false;
    let isArriveZ = false;

    if (Math.abs(x - humanObjects[name].position.x) > delta_x) {
      humanObjects[name].lookAt(x, 0.17, z);
      torusObjects[name].position.x = ringObjects[name].position.x = humanObjects[name].position.x += delta_x;
    }
    else {
      isArriveX = true;
    }

    if (Math.abs(z - humanObjects[name].position.z) > delta_z) {
      humanObjects[name].lookAt(x, 0.17, z);
      torusObjects[name].position.z = ringObjects[name].position.z = humanObjects[name].position.z += delta_z;
    }
    else {
      isArriveZ = true;
    }

    if (isArriveX && isArriveZ) humanObjects[name].counter++;
  }
}

const focusCamera = (name) => {
  setDiamondPosition(humanObjects[name].position.x, 2, humanObjects[name].position.z)

  controls.target.set(humanObjects[name].position.x, 0, humanObjects[name].position.z);
  controls.update();
}

const setDiamondPosition = (x, y, z) => {
  diamondBottom.position.x = x;
  diamondBottom.position.y = y;
  diamondBottom.position.z = z;

  diamondTop.position.x = x;
  diamondTop.position.y = y + 0.2;
  diamondTop.position.z = z;
}

const setDiamondVisibility = (state) => {
  diamondTop.visible = state;
  diamondBottom.visible = state;
}

// Informasi Orang yang melakukan pelanggaran
const notifyHumanInformation = (humanName) => {
  iziToast.show({
    class: "HumanInformation",
    theme: 'dark',
    icon: 'icon-person',
    title: 'Informasi Personal',
    message: '<br><b>Nama :</b> ' + profiles[humanName].nama + '<br><b>ID Member :</b> ' + profiles[humanName].id_member + ' <br> <b>Jenis Kelamin :</b> ' + profiles[humanName].jenis_kelamin + ' <br> <b>No Telpon :</b> ' + profiles[humanName].no_telepon + '',
    position: 'bottomCenter', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter
    progressBarColor: 'rgb(0, 255, 184)',
    timeout: false,
    image: "assets/img/" + profiles[humanName].img + ".jpg",
    imageWidth: 200,
    displayMode: 'once',
    layout: 2,
    maxWidth: 475
  });
}

const notifyIziToastError = (humanName) => {
  //Notifikasi  
  iziToast.error({
    title: 'Bahaya',
    message: humanName + ' tidak menjaga jarak! ',
    position: 'topRight',
    displayMode: 'once',
    transitionIn: 'fadeInDown',
    transitionOut: 'fadeOutUp',
    timeout: false,
    buttons: [
      ['<button>Lihat</button>', function (instance, toast) {
        instance.hide({
          transitionOut: 'fadeOutRight',
          onClosing: () => {
            humanObjectFollowed = humanName;
            var toast = document.querySelector('.HumanInformation'); // Selector of your toast
            if (toast) {
              iziToast.hide({
                transitionOut: 'fadeOutDown'
              }, toast);
            }
            notifyHumanInformation(humanName);
          }
        }, toast);
      }],
    ],
    onOpened: function () {
      humanObjects[humanName].alert = true;
    },
    onClosed: function () {
      humanObjects[humanName].alert = false;
    }
  });
}

const checkDistance = () => {
  // Menghitung jarak antar objek dengan objek lainnya
  const humanObjectsKeys = Object.keys(humanObjects);
  let isHumanSafe = new Array(humanObjectsKeys.length).fill(true);
  for (let i = 0; i < humanObjectsKeys.length; i++) {
    // console.log(humanObjectsKeys[i]);
    const firstHumanName = humanObjectsKeys[i];
    for (let j = i + 1; j < humanObjectsKeys.length; j++) {
      // console.log(humanObjectsKeys[i] + " " + humanObjectsKeys[j]);
      const secondHumanName = humanObjectsKeys[j];
      if (firstHumanName != secondHumanName) {
        let distance = Math.sqrt(Math.pow(humanObjects[firstHumanName].position.x - humanObjects[secondHumanName].position.x, 2) + Math.pow(humanObjects[firstHumanName].position.z - humanObjects[secondHumanName].position.z, 2));
        // console.log(firstHumanName + " + " + secondHumanName + ": " + distance);
        if (distance < 1) {
          ringObjects[firstHumanName].material.color.setHex(0xff0000);
          ringObjects[secondHumanName].material.color.setHex(0xff0000);

          torusObjects[firstHumanName].material.color.setHex(0xff0000);
          torusObjects[secondHumanName].material.color.setHex(0xff0000);

          if (!humanObjects[secondHumanName].alert || !humanObjects[firstHumanName].alert) {
            // console.log(firstHumanName + " + " + secondHumanName);/
            notifyIziToastError(firstHumanName);
            notifyIziToastError(secondHumanName);
          }
          isHumanSafe[i] = isHumanSafe[j] = false;
        }
        else if (isHumanSafe[i] && isHumanSafe[j]) {
          ringObjects[firstHumanName].material.color.setHex(0x5be305);
          ringObjects[secondHumanName].material.color.setHex(0x5be305);

          torusObjects[firstHumanName].material.color.setHex(0x5be305);
          torusObjects[secondHumanName].material.color.setHex(0x5be305);
        }
      }
    };
  };
}

init();
animate();


function init() {

  const container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.x = 10;
  camera.position.y = 10;
  camera.position.z = 10;

  // scene

  scene = new THREE.Scene();

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.position.set(7, 25, 7);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 4096;
  dirLight.shadow.mapSize.height = 4096;
  dirLight.shadow.camera.far = 40;
  dirLight.shadow.camera.top = 10;
  dirLight.shadow.camera.bottom = - 10;
  dirLight.shadow.camera.left = - 10;
  dirLight.shadow.camera.right = 10;
  scene.add(dirLight);

  // model
  const loader = new FBXLoader();
  loader.load('models/fbx/office/office.fbx', function (object) {

    object.traverse(function (child) {

      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }

    });
    object.scale.set(0.01, 0.01, 0.01);
    scene.add(object)
  }
  );

  loader.load('models/fbx/human/Dougie_Toping_walking.fbx', function (object) {
    let name = 'Dougie Toping';
    mixers[name] = new THREE.AnimationMixer(object);
    animations[name] = {};
    let action = mixers[name].clipAction(object.animations[0]);
    animations[name]['walking'] = {
      clip: object.animations[0],
      action: action
    }
    action.play();

    loader.load('models/fbx/human/Dougie_Toping_idle.fbx', function (objectWalking) {
      const walkingAction = mixers[name].clipAction(objectWalking.animations[0]);
      animations[name]['idle'] = {
        clip: objectWalking.animations[0],
        action: walkingAction
      }
    });

    object.traverse(function (child) {

      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }

    });
    object.scale.set(0.0038, 0.0038, 0.0038);
    object.position.x = -4.2; //x
    object.position.y = 0.17;
    object.position.z = 2; //menandakan y di firestore. 
    humanObjects[name] = object;
    humanObjects[name].alert = false;
    humanObjects[name].counter = 0;
    scene.add(humanObjects[name]);

    createCircleRadius(name, 0x5be305, object.position.x, object.position.z);
  }
  );

  loader.load('models/fbx/human/Stan_Bauduccio_walking.fbx', function (object) {
    let name = 'Stan Bauduccio';
    mixers[name] = new THREE.AnimationMixer(object);
    animations[name] = {};
    let action = mixers[name].clipAction(object.animations[0]);
    animations[name]['walking'] = {
      clip: object.animations[0],
      action: action
    }
    action.play();

    loader.load('models/fbx/human/Stan_Bauduccio_idle.fbx', function (objectWalking) {
      const walkingAction = mixers[name].clipAction(objectWalking.animations[0]);
      animations[name]['idle'] = {
        clip: objectWalking.animations[0],
        action: walkingAction
      }
    });

    object.traverse(function (child) {

      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }

    });
    object.scale.set(0.008, 0.008, 0.008);
    object.position.x = 3.85;
    object.position.y = 0.17;
    object.position.z = 5;
    humanObjects[name] = object;
    humanObjects[name].alert = false;
    humanObjects[name].counter = 0;
    scene.add(humanObjects[name]);

    createCircleRadius(name, 0x5be305, object.position.x, object.position.z);
  }
  );

  loader.load('models/fbx/human/Kamillah_Attawell_walking.fbx', function (object) {
    let name = 'Kamillah Attawell';
    mixers[name] = new THREE.AnimationMixer(object);
    animations[name] = {};
    let action = mixers[name].clipAction(object.animations[0]);
    animations[name]['walking'] = {
      clip: object.animations[0],
      action: action
    }
    action.play();

    object.traverse(function (child) {

      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }

    });
    loader.load('models/fbx/human/Kamillah_Attawell_idle.fbx', function (objectWalking) {
      const walkingAction = mixers[name].clipAction(objectWalking.animations[0]);
      animations[name]['idle'] = {
        clip: objectWalking.animations[0],
        action: walkingAction
      }
    });
    object.scale.set(0.008, 0.008, 0.008);
    object.position.x = 2.3;
    object.position.y = 0.17;
    object.position.z = -4;
    humanObjects[name] = object;
    humanObjects[name].alert = false;
    humanObjects[name].counter = 0;
    scene.add(humanObjects[name]);

    createCircleRadius(name, 0x5be305, object.position.x, object.position.z);
  }
  );

  const geometry = new THREE.ConeGeometry(0.1, 0.2, 4);
  const material = new THREE.MeshPhongMaterial({
    map: null,
    color: 0x2479d5,
    emissive: 0x1200a7,
    specular: 0xffffff,
    shininess: 20,
    side: THREE.FrontSide,
  });
  diamondTop = new THREE.Mesh(geometry, material);
  diamondTop.receiveShadow = true;
  scene.add(diamondTop);

  diamondBottom = new THREE.Mesh(geometry, material);
  diamondBottom.rotation.z = Math.PI;
  diamondTop.receiveShadow = true;
  scene.add(diamondBottom);

  setDiamondVisibility(false);
  setDiamondPosition(0, 2, 0);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.maxDistance = 20;
  controls.update();

  window.addEventListener('resize', onWindowResize, false);

  window.addEventListener('mousedown', (event) => {
    if (event.button == 2) {
      humanObjectFollowed = null;
    }
  })

  $.getJSON("MOCK_DATA.json", function (json) {
    for (var i in json) {
      profiles[json[i].nama] = json[i];
    }
    // console.log(profiles);
  });
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  Object.values(mixers).forEach(mixer => {
    mixer.update(delta);
  });

  checkDistance();

  Object.keys(humanObjects).forEach(name => {
    // console.log(coordinates[name])
    if (coordinates[name] && coordinates[name].x.length > humanObjects[name].counter) {
      animations[name]['idle'].action.stop();
      animations[name]['walking'].action.play();
      moveHumanToTarget(name, coordinates[name].x[humanObjects[name].counter], coordinates[name].y[humanObjects[name].counter], 0.017);
    } else {
      animations[name]['walking'].action.stop();
      animations[name]['idle'].action.play();
    }
  })

  if (humanObjectFollowed) {
    setDiamondVisibility(true);
    focusCamera(humanObjectFollowed);
  } else {
    setDiamondVisibility(false);
  }

  renderer.render(scene, camera);

}