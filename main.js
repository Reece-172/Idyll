//variable declaration section
let physicsWorld,
  scene,
  camera,
  renderer,
  rigidBodies = [],
  tmpTrans = null;
/**TO-DO
 * Orbital control
 * New models
 * Collision -> on new objects
 **/
let ballObject = null,
  moveDirection = { left: 0, right: 0, forward: 0, back: 0, up: 0, down: 0 }; //used to hold the respective directional key (WASD)

// Variable to store first person / third person state
// Handling "firstPersonPressed" differently from firstPerson so
// camera change can be applied immediately using "orbitControls.update()"
// in "updatePhysics()". If left out, change only happens on mouse click.
// If treated depending on firstPerson variable, then "orbitControls.update()"
// is run on every "updatePhysics()" call, which causes erratic camera / character movement
let firstPerson = false, firstPersonPressed = false;
let lookLeft = false,
  lookRight = false,
  lookBack = false;

// Control Temp data
var orbitControls;
walkDirection = new THREE.Vector3();
rotateAngle = new THREE.Vector3(0, 1, 0);


let heroObject = null,
  HeroMoveDirection = { left: 0, right: 0, forward: 0, back: 0 };
const STATE = { DISABLE_DEACTIVATION: 4 };
//@deveshj48 add the collision configuration here -> kniematic objects and what nnot

// let collectible1Object = null, //put here if want to make the object global
//   collectible2Object = null;

let colGroupBall = 2, colGroupChar = 5, colGroupCollectible = 3, colGroupBlock = 1, colGroupTree = 4, colGroupModel = 6; //collision purposes

let collectCounter;

let cbContactPairResult, blockPlane, ball, collectible1;
let cbContactResult;
const GAMESTATE={
  PAUSED:0,
  RUNNING:1,
  GAMEOVER:2
};//for loading screen
window.addEventListener('load',function(){
  var loadingScreen=document.getElementById('loadingScreen');
  document.body.removeChild(loadingScreen);
});


//for fps display
(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()

let isCollection1Present, isCollection2Present;
let collectibles = [];

let npcContact = false; //boolean to check if player made contact with NPC

var mapCamera,
  mapWidth = 240,
  mapHeight = 160;
//Ammojs Initialization
Ammo().then(start);

function start() {
  tmpTrans = new Ammo.btTransform();
  collectCounter = 0;
  this.gamestate=GAMESTATE.RUNNING;

 
  
  setupPhysicsWorld();
  setupGraphics();

  for (var i = 0; i < 70; i++) { //add high and low collectibles so user has to jump
    collectible1 = new Collectible();
    collectible1.createCollectible();
    collectibles.push(collectible1);
  }


  createBlock();
  createBall();
  loadCharacter();
  createWorld();

  // for (var i = 0; i < 30; i++) {
  //   createGrass();
  // }
  // for (var i = 0; i < 60; i++) {
  //   createFlower_1();
  // }
  // for (var i = 0; i < 60; i++) {
  //   createFlower_2();
  // }
  // for (var i = 0; i < 20; i++) {
  //   createMushroom();
  // }

  // for (var i = 0; i < 50; i++) {
  // createTree_2();
  // }
  // for (var i = 0; i < 50; i++) {
  //   createTree_3();
  // }


  loadVolcano();
  //createHead();
  // for (var i = 0; i < 50; i++) {
  //   createTree();
  // }  

  setupContactResultCallback();
  setupContactPairResultCallback();

  setupEventHandlers();
  renderFrame();
}

function setupPhysicsWorld() {
  let collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(),
    dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration),
    overlappingPairCache = new Ammo.btDbvtBroadphase(),
    solver = new Ammo.btSequentialImpulseConstraintSolver();

  physicsWorld = new Ammo.btDiscreteDynamicsWorld(
    dispatcher,
    overlappingPairCache,
    solver,
    collisionConfiguration
  );
  physicsWorld.setGravity(new Ammo.btVector3(0, -25, 0));

  //remember to destroy all 'new' Ammo stuff at the end
}

function setupGraphics() {
  //create clock for timing
  clock = new THREE.Clock();

  //create the scene
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xffffff, 0.015, 1100);
  const loader = new THREE.CubeTextureLoader();
  const texture = loader.load([
    "./resources/skybox/posx.jpg", //left
    "./resources/skybox/negx.jpg", //right
    "./resources/skybox/posy.jpg", //up
    "./resources//skybox/negy.jpg", //down
    "./resources/skybox/posz.jpg", //front
    "./resources/skybox/negz.jpg", //back
  ]);

  scene.background = texture; //set the cube map as the background

  //create camera
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.2,
    5000
  );
  camera.position.set(0, 20, 50);
  camera.lookAt(new THREE.Vector3(0, 20, 20));

  mapCamera = new THREE.OrthographicCamera(
    window.innerWidth / -10, // Left
    window.innerWidth / 10, // Right
    window.innerHeight / 10, // Top
    window.innerHeight / -10, // Bottom
    -5000, // Near
    10000
  ); // Far
  mapCamera.up = new THREE.Vector3(0, 0, -1);
  //get the ball object x and y coord
  mapCamera.lookAt(new THREE.Vector3(0, -1, 0));
  // Removed the mapCamera from being a sub-object of camera
  // to avoid rotation problem
  // camera.add(mapCamera);

  const listener = new THREE.AudioListener();
  camera.add(listener);


  const loadAudio = new THREE.AudioLoader();

  const audio = new THREE.Audio(listener);

  loadAudio.load("./resources/idyll.mp3", function (buffer) {
    audio.setBuffer(buffer);
    audio.setLoop(true);
    audio.setVolume(0.4);
    audio.play();
  });
  scene.add(audio);

  scene.add(camera);

  const PointsEl = document.querySelector("#PointsEl");
  console.log(PointsEl);

  //Add hemisphere light
  let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.1);
  hemiLight.color.setHSL(0.6, 0.6, 0.6);
  hemiLight.groundColor.setHSL(0.1, 1, 0.4);
  hemiLight.position.set(0, 50, 0);
  scene.add(hemiLight);

  //Add directional light
  let dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.color.setHSL(0.1, 1, 0.95);
  dirLight.position.set(-1, 1.75, 1);
  dirLight.position.multiplyScalar(100);
  scene.add(dirLight);

  dirLight.castShadow = true;

  dirLight.shadow.mapSize.width = 4098;
  dirLight.shadow.mapSize.height = 4098;

  let d = 200; //adjust

  dirLight.shadow.camera.left = -d;
  dirLight.shadow.camera.right = d;
  dirLight.shadow.camera.top = d;
  dirLight.shadow.camera.bottom = -d;

  dirLight.shadow.camera.far = 13500;

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Controls
  orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
  orbitControls.enablePan = false;
  orbitControls.minDistance = 15;
  orbitControls.maxDistance = 20;
  orbitControls.maxPolarAngle = Math.PI / 2 - 0.05;
  orbitControls.update();

  renderer.gammaInput = true;
  renderer.gammaOutput = true;

  renderer.shadowMap.enabled = true;
}

function renderFrame() {
  requestAnimationFrame(renderFrame);
  let deltaTime = clock.getDelta();
  //createFont();
  
    moveBall();
  
  //moveHero();

  if (firstPerson == true) {
    camera.lookAt(ballObject.position.x, ballObject.position.y + 3, ballObject.position.z);
  } else {
    camera.lookAt(ballObject.position);
  }
  updatePhysics(deltaTime);
  if(this.gamestate===GAMESTATE.PAUSED){
    document.getElementById("Game Paused").style.visibility="visible";
  }
  else{
    document.getElementById("Game Paused").style.visibility="hidden";
  }

  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);

  //handles collectibles
  if (collectibles.length !== 0) {
    isCollect();
  }
  const points = document.getElementById('PointsEl'); 
  points.innerHTML = collectCounter; //updates points on screen

  renderer.render(scene, camera);

  renderer.clearDepth();
  renderer.setScissorTest(true);
  renderer.setScissor(
    window.innerWidth - mapWidth - 16,
    window.innerHeight - mapHeight - 16,
    mapWidth,
    mapHeight
  );
  renderer.setViewport(
    window.innerWidth - mapWidth - 16,
    window.innerHeight - mapHeight - 16,
    mapWidth,
    mapHeight
  );

  renderer.render(scene, mapCamera);
  renderer.setScissorTest(false);

}

function setupEventHandlers() {
  window.addEventListener("keydown", handleKeyDown, false);
  window.addEventListener("keyup", handleKeyUp, false);
}

function handleKeyDown(event) {
  let keyCode = event.keyCode; //keycode determines key pressed

  switch (keyCode) {
    case 87: //W: FORWARD
      moveDirection.forward = 1;
      HeroMoveDirection.forward = 1;
      break;

    case 83: //S: BACK
      moveDirection.back = 1;
      HeroMoveDirection.forward = 1;
      break;

    case 65: //A: LEFT
      moveDirection.left = 1;
      HeroMoveDirection.forward = 1;
      break;

    case 68: //D: RIGHT
      moveDirection.right = 1;
      HeroMoveDirection.forward = 1;
      break;

    case 70: //F: Toggle First Person
      if (firstPerson == false) {
        firstPerson = true;
      } else {
        firstPerson = false;
      }
      firstPersonPressed = true;
      break;

    case 37:
      lookLeft = true;
      break;
    case 39:
      lookRight = true;
      break;
    case 40:
      lookBack = true;
      break;

    case 32: //space bar
      //if (ballObject.position.getComponent(1) <= 10){ //get the y-component. only allow to jump if the y-comp is <=6, otherwise they can jump forever
      //moveDirection.up = 1 //infinitely goes up if key is pressed and held
      // break;
      //}
      // jump(); //get to work simultaneously with movement, ie, be able to jump while a movement key is pressed
      moveDirection.up = true;
      break;

    case 77: //m
      checkContact(); //shows what the ball collides with
      break;

    case 80:
      TogglePause(); 
    // case 67: //c
    //   isCollect();
  }
}

function handleKeyUp(event) {
  let keyCode = event.keyCode;

  switch (keyCode) {
    case 87: //FORWARD
      moveDirection.forward = 0;
      HeroMoveDirection.forward = 0;
      break;

    case 83: //BACK
      moveDirection.back = 0;
      HeroMoveDirection.forward = 0;
      break;

    case 65: //LEFT
      moveDirection.left = 0;
      HeroMoveDirection.forward = 0;
      break;

    case 68: //RIGHT
      moveDirection.right = 0;
      HeroMoveDirection.forward = 0;
      break;

    case 70: // (First Person Button, "F", Pressed --> Change Camera)
      firstPersonPressed = false;
      break;

    case 37:
      lookLeft = false;
      break;
    case 39:
      lookRight = false;
      break;
    case 40:
      lookBack = false;
      break;

    case 32: //space bar
      moveDirection.up = 0;
  }
}



function createBlock() {
  let pos = { x: 0, y: 0, z: 0 };
  let scale = { x: 1000, y: 2, z: 1000 };
  let quat = { x: 0, y: 0, z: 0, w: 1 };
  let mass = 0;

  //threeJS Section
  const grass = new THREE.TextureLoader().load("./resources/grass.jpg");
  blockPlane = new THREE.Mesh(
    new THREE.BoxBufferGeometry(),
    new THREE.MeshPhongMaterial({ map: grass })
  );

  blockPlane.position.set(pos.x, pos.y, pos.z);
  blockPlane.scale.set(scale.x, scale.y, scale.z);

  blockPlane.castShadow = true;
  blockPlane.receiveShadow = true;

  scene.add(blockPlane);

  blockPlane.userData.tag = "blockPlane";

  //Ammojs Section
  let transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
  transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
  let motionState = new Ammo.btDefaultMotionState(transform);

  const colShape = new Ammo.btBoxShape(
    new Ammo.btVector3(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5)
  );
  colShape.setMargin(0.05);

  let localInertia = new Ammo.btVector3(0, 0, 0);
  colShape.calculateLocalInertia(mass, localInertia);

  let rbInfo = new Ammo.btRigidBodyConstructionInfo(
    mass,
    motionState,
    colShape,
    localInertia
  );
  let body = new Ammo.btRigidBody(rbInfo);

  body.setFriction(4);
  body.setRollingFriction(10);

  physicsWorld.addRigidBody(
    body,
    colGroupBlock,
    colGroupBall | colGroupChar | colGroupCollectible
  );

  body.threeObject = blockPlane;

  blockPlane.userData.physicsBody = body;
}

function createBall() {
  let pos = { x: 0, y: 4, z: 0 };
  let radius = 2;
  let quat = { x: 0, y: 0, z: 0, w: 1 };
  let mass = 1;

  //threeJS Section
  ball = ballObject = new THREE.Mesh(
    new THREE.DodecahedronGeometry(radius),
    new THREE.MeshPhongMaterial({ color: 0xff0505 })
  );

  ball.position.set(pos.x, pos.y, pos.z);

  ball.castShadow = true;
  ball.receiveShadow = true;

  scene.add(ball);

  ball.userData.tag = "ball";

  //Ammojs Section
  let transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
  transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
  transform.setScale;
  let motionState = new Ammo.btDefaultMotionState(transform);

  let colShape = new Ammo.btSphereShape(radius);
  colShape.setMargin(0.05);

  let localInertia = new Ammo.btVector3(0, 0, 0);
  colShape.calculateLocalInertia(mass, localInertia);

  let rbInfo = new Ammo.btRigidBodyConstructionInfo(
    mass,
    motionState,
    colShape,
    localInertia
  );
  let body = new Ammo.btRigidBody(rbInfo);

  body.setFriction(4);
  body.setRollingFriction(10);
  body.setActivationState(STATE.DISABLE_DEACTIVATION);

  physicsWorld.addRigidBody(body, colGroupBall, colGroupChar | colGroupBlock | colGroupTree | colGroupModel);

  ball.userData.physicsBody = body;
  rigidBodies.push(ball);
  body.threeObject = ball;
}



function loadCharacter() {
  let pos = { x: 10, y: 1, z: -50 };
  let quat = { x: 0, y: 0, z: 0, w: 1 };
  let mass = 0;

  var loader = new THREE.GLTFLoader();
  loader.load(
    "./resources/models/Yasuo.glb",
    function (gltf) {
      gltf.scene.scale.set(10, 10, 10);
      gltf.scene.traverse(function (node) {
        if (node.isMesh) {
          node.castShadow = true;
        }
      });
      const yasuo = gltf.scene;
      yasuo.position.set(pos.x, pos.y, pos.z); //initial position of the model
      heroObject = new THREE.Mesh(yasuo.geometry, yasuo.material);
      scene.add(yasuo);
      //Ammojs Section -> physics section
      let transform = new Ammo.btTransform();
      transform.setIdentity();
      transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
      transform.setRotation(
        new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
      );

      let motionState = new Ammo.btDefaultMotionState(transform);

      let localInertia = new Ammo.btVector3(0, 0, 0);

      const colShape = new Ammo.btBoxShape(
        new Ammo.btVector3(yasuo.scale.x * 0.3, yasuo.scale.y * 2, yasuo.scale.z * 0.5) //this is the size of the box around the model
      );
      colShape.getMargin(0.05);
      colShape.calculateLocalInertia(mass, localInertia);
      let rbInfo = new Ammo.btRigidBodyConstructionInfo(
        mass,
        motionState,
        colShape,
        localInertia
      );
      let body = new Ammo.btRigidBody(rbInfo);

      body.setFriction(4);

      body.setActivationState(STATE.DISABLE_DEACTIVATION);

      physicsWorld.addRigidBody(
        body,
        colGroupChar,
        colGroupBall | colGroupBlock
      );

      yasuo.userData.physicsBody = body;
      rigidBodies.push(yasuo);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
}

function loadVolcano() {
  let pos = { x: 0, y: 0, z: 0 };
  let quat = { x: 0, y: 0, z: 0, w: 1 };
  let mass = 0;

  var loader = new THREE.GLTFLoader();
  loader.load(
    "./resources/models/Volcano.glb",
    function (gltf) {
      gltf.scene.scale.set(400, 400, 400);
      gltf.scene.translateX(600);
      gltf.scene.translateZ(-600);
      gltf.scene.translateY(0);
      gltf.scene.traverse(function (node) {
        if (node.isMesh) {
          node.castShadow = true;
        }
      });
      const model = gltf.scene;

      model.castShadow = true;
      model.receiveShadow = true;
      scene.add(model);
      //Ammojs Section -> physics section
      let transform = new Ammo.btTransform();
      transform.setIdentity();
      transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
      transform.setRotation(
        new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
      );

      let motionState = new Ammo.btDefaultMotionState(transform);

      let localInertia = new Ammo.btVector3(0, 0, 0);
      let verticesPos = model.geometry.getAttribute("position").array;
      let triangles = [];
      for (let i = 0; i < verticesPos.length; i += 3) {
        triangle.push({
          x: verticesPos[i],
          y: verticesPos[i + 2],
          z: verticesPos(i + 3),
        });
      }

      let triangle,
        triangle_mesh = new Ammo.btTriangleMesh();

      let vecA = new Ammo.btVector3(0, 0, 0);
      let vecB = new Ammo.btVector3(0, 0, 0);
      let vecC = new Ammo.btVector3(0, 0, 0);

      for (let i = 0; i < triangles.length - 3; i += 3) {
        vecA.setX(triangles[i].x);
        vecA.setY(triangles[i].y);
        vecA.setZ(triangles[i].z);

        vecB.setX(triangles[i + 1].x);
        vecB.setY(triangles[i + 1].y);
        vecB.setZ(triangles[i + 1].z);

        vecC.setX(triangles[i + 2].x);
        vecC.setY(triangles[i + 2].y);
        vecC.setZ(triangles[i + 2].z);

        triangle_mesh.addTriangle(vecA, vecB, vecC, true);
      }

      Ammo.destroy(vecA);
      Ammo.destroy(vecB);
      Ammo.destroy(vecC);

      const shape = new Ammo.btconvexTriangleMeshShape(
        triangle_mesh,
        (model.geometry.verticesNeedUpdate = true)
      );
      shape.getMargin(0.05);
      shape.calculateLocalInertia(mass, localInertia);
      let rbInfo = new Ammo.btRigidBodyConstructionInfo(
        mass,
        motionState,
        colShape,
        localInertia
      );
      let body = new Ammo.btRigidBody(rbInfo);

      body.setFriction(4);
      body.setActivationState(STATE.DISABLE_DEACTIVATION);

      physicsWorld.addRigidBody(body);

      model.userData.physicsBody = body;
      rigidBodies.push(model);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
}

function directionOffset() {
  var directionOffset = 0;

  if (moveDirection.forward) {
    if (moveDirection.left) {
      directionOffset = Math.PI / 4;
    } else if (moveDirection.right) {
      directionOffset = - Math.PI / 4;
    }
  } else if (moveDirection.back) {
    if (moveDirection.left) {
      directionOffset = Math.PI / 4 + Math.PI / 2;
    } else if (moveDirection.right) {
      directionOffset = - Math.PI / 4 - Math.PI / 2;
    } else {
      directionOffset = Math.PI
    }
  } else if (moveDirection.left) {
    directionOffset = Math.PI / 2;
  } else if (moveDirection.right) {
    directionOffset = - Math.PI / 2;
  }

  return directionOffset;

}

function moveBall() {
  //this goes in renderframe()
  if(this.gamestate===GAMESTATE.PAUSED){
    return;
  }
  let scalingFactor = 20;

  let moveX = moveDirection.right - moveDirection.left;
  let moveZ = moveDirection.back - moveDirection.forward;
  let moveY = moveDirection.up - moveDirection.down * 2;

  if (moveX == 0 && moveY == 0 && moveZ == 0) return;

  var dirOffset = directionOffset();
  var jumpOffset = (Math.PI / 4);


  camera.getWorldDirection(walkDirection);
  walkDirection.y = 0;
  walkDirection.normalize();

  if (moveDirection.up == true) {
    tempDirection = new THREE.Vector3();
    tempDirection = walkDirection.applyAxisAngle(rotateAngle, dirOffset);
    tempDirection.normalize();
    walkDirection.applyAxisAngle(tempDirection, jumpOffset);
    console.log("{1} Direction for Impulse:\n" + "\nx: " + walkDirection.x + "\ny: " + walkDirection.y + "\nz: " + walkDirection.z);

  } else {
    walkDirection.applyAxisAngle(rotateAngle, dirOffset);
    console.log("{2} Direction for Impulse:\n" + "\nx: " + walkDirection.x + "\ny: " + walkDirection.y + "\nz: " + walkDirection.z);
  }

  let resultantImpulse = new Ammo.btVector3(walkDirection.x, walkDirection.y, walkDirection.z);
  resultantImpulse.op_mul(scalingFactor);

  let physicsBody = ballObject.userData.physicsBody;
  physicsBody.setLinearVelocity(resultantImpulse);
}


function setupContactResultCallback() {
  cbContactResult = new Ammo.ConcreteContactResultCallback();

  // Our implementation of addSingleResult() is straight forward and understandable:
  // Get distance from the contact point and exit if the distance is greater than zero.
  // Obtain the participating physics objects.
  // From them get their respective three.js objects.
  // Bearing in mind we are just after the tiles, we check for the three.js object that is not the ball and assign variables appropriately.
  // Finally, with some formatting, we log the information to the console.
  cbContactResult.addSingleResult = function (
    cp,
    colObj0Wrap,
    partId0,
    index0,
    colObj1Wrap,
    partId1,
    index1
  ) {
    let contactPoint = Ammo.wrapPointer(cp, Ammo.btManifoldPoint);

    const distance = contactPoint.getDistance();

    if (distance > 0) return;

    let colWrapper0 = Ammo.wrapPointer(
      colObj0Wrap,
      Ammo.btCollisionObjectWrapper
    );
    let rb0 = Ammo.castObject(
      colWrapper0.getCollisionObject(),
      Ammo.btRigidBody
    );

    let colWrapper1 = Ammo.wrapPointer(
      colObj1Wrap,
      Ammo.btCollisionObjectWrapper
    );
    let rb1 = Ammo.castObject(
      colWrapper1.getCollisionObject(),
      Ammo.btRigidBody
    );

    let threeObject0 = rb0.threeObject;
    let threeObject1 = rb1.threeObject;

    let tag, localPos, worldPos;

    if (threeObject0.userData.tag != "ball") {
      tag = threeObject0.userData.tag;
      localPos = contactPoint.get_m_localPointA();
      worldPos = contactPoint.get_m_positionWorldOnA();
    } else {
      tag = threeObject1.userData.tag;
      localPos = contactPoint.get_m_localPointB();
      worldPos = contactPoint.get_m_positionWorldOnB();
    }

    let localPosDisplay = { x: localPos.x(), y: localPos.y(), z: localPos.z() };
    let worldPosDisplay = { x: worldPos.x(), y: worldPos.y(), z: worldPos.z() };

    console.log({ tag, localPosDisplay, worldPosDisplay });
  };
}

function checkContact() {
  physicsWorld.contactTest(ball.userData.physicsBody, cbContactResult);
}

function jump() {
  if(this.gamestate===GAMESTATE.PAUSED){
    return;
  }
  cbContactPairResult.hasContact = false;

  physicsWorld.contactPairTest(
    ball.userData.physicsBody,
    blockPlane.userData.physicsBody,
    cbContactPairResult
  );

  if (!cbContactPairResult.hasContact) return;

  let jumpImpulse = new Ammo.btVector3(0, 15, 0);

  let physicsBody = ball.userData.physicsBody;
  physicsBody.setLinearVelocity(jumpImpulse);
}

  

function isCollect() { //checking the collectibles array if any of the collectibles were in contact with the ball. If so, remove collectible from scene

  let i = 0;


  while (true) {
    cbContactPairResult.hasContact = false;
    if (i >= collectibles.length) return;
    physicsWorld.contactPairTest(ball.userData.physicsBody, collectibles[i].getCollectibleObject().userData.physicsBody, cbContactPairResult); //perform a test to see if there is contact 
    if (cbContactPairResult.hasContact) { //if there is contact between the ball and collectible object

      collectCounter++;
      physicsWorld.removeRigidBody(collectibles[i].getCollectibleObject().userData.physicsBody); //remove this rigid body from the physics world
      scene.remove(collectibles[i].getCollectibleObject()); //remove from scene
      rigidBodies = arrayRemove(rigidBodies, collectibles[i].getCollectibleObject()); //remove from rigidbodies array
      collectibles.splice(i, 1); //delete element from collectibles array

      //console.log(collectCounter);
      return;
    }

    i++;

  }
}

function TogglePause(){
  if(this.gamestate===GAMESTATE.PAUSED){
    this.gamestate=GAMESTATE.RUNNING;

  }
  else{
    this.gamestate=GAMESTATE.PAUSED;


  }
}

function Menu(){
  //window.location.href = "menu.html";
  // var menu_div=document.createElement('div');
  // menu_div.className='flex text-align-center text-lg fixed absolute font-serif text-white select-none';
  // var menu_ul=document.createElement('ul');
  // var menu_li=document.createElement('li');
  // menu_div.style.left='45%';
  // menu_div.style.top='35%';


  document.getElementById("Menu_Buttons").style.display='flex';
}

function Resume(){
  //window.location.href="index.html";
  document.getElementById("Menu_Buttons").style.display='none';

}
function Controls(){
  const controls=document.getElementById("controlsScreen");
  controls.style.display='flex';
  //set controls div to visible

}
function Back(){
  const controls=document.getElementById("controlsScreen");
  controls.style.display='none';
}
function Quit(){
 location.reload();

}
function Begin(){
  const landing_page= document.getElementById('landingScreen');
  landing_page.style.display='none';
  const menu_button=document.getElementById('menu');
  menu_button.style.display='flex';
  const points=document.getElementById('Points');
  points.style.display='flex';
}

function setupContactPairResultCallback(){ //this is for the ball and the block

  cbContactPairResult = new Ammo.ConcreteContactResultCallback();

  cbContactPairResult.hasContact = false;

  cbContactPairResult.addSingleResult = function(cp, colObj0Wrap, partId0, index0, colObj1Wrap, partId1, index1){

      let contactPoint = Ammo.wrapPointer( cp, Ammo.btManifoldPoint );

      const distance = contactPoint.getDistance();

      if( distance > 0 ) return;

      this.hasContact = true;
  };
}
function isContactNPC() {
  cbContactPairResult.hasContact = false;

  physicsWorld.contactPairTest(
    ball.userData.physicsBody,
    blockPlane.userData.physicsBody, //change this line
    cbContactPairResult
  );

  npcContact = false

  if (!cbContactPairResult.hasContact) return;

  //what to do if there is contact:
    //press button
    npcContact = true;

      this.hasContact = true;

}

function updatePhysics(deltaTime) { // update physics world
  // Step world
  physicsWorld.stepSimulation(deltaTime, 10);
  // if(this.gamestate===GAMESTATE.PAUSED || this.gamestate===GAMESTATE.MENU){
  //   return;
  // }
  
  // Update rigid bodies
  //for (let i = 0; i < rigidBodies.length; i++) {
  //console.log(rigidBodies);
  //let objThree = rigidBodies[i];
  let objThree = ballObject;
  let objAmmo = objThree.userData.physicsBody;
  let ms = objAmmo.getMotionState();
  if (ms) {
    ms.getWorldTransform(tmpTrans);
    let p = tmpTrans.getOrigin();
    let q = tmpTrans.getRotation();

    camera.position.x += (p.x() - objThree.position.x);
    camera.position.y += (p.y() - objThree.position.y);
    camera.position.z += (p.z() - objThree.position.z);

    // Removed the mapCamera from being a sub-object of camera
    // to avoid rotation problem
    mapCamera.position.x = objThree.position.x;
    mapCamera.position.z = objThree.position.z;


    if (firstPerson == true) {
      orbitControls.enableZoom = false;
      orbitControls.minDistance = 1;
      orbitControls.maxDistance = 1;
      orbitControls.maxPolarAngle = Math.PI / 1.5 - 0.05;
      orbitControls.minPolarAngle = Math.PI / 3;
      orbitControls.target = new THREE.Vector3(ballObject.position.x, ballObject.position.y + 3, ballObject.position.z);
    } else {
      orbitControls.minDistance = 15;
      orbitControls.maxDistance = 20;
      orbitControls.maxPolarAngle = Math.PI / 2 - 0.05;
      orbitControls.target = new THREE.Vector3(ballObject.position.x, ballObject.position.y, ballObject.position.z);
    }

    if (firstPersonPressed == true) {
      orbitControls.update();
    }

    objThree.position.set(p.x(), p.y(), p.z());
    objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());

  }
}

function arrayRemove(arr, value) {

  return arr.filter(function (element) {
    return element != value; //creates a new array, without the specific element
  });
}
