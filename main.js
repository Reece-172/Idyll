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
let firstPerson = false;
let lookLeft = false,
  lookRight = false,
  lookBack = false;

let heroObject = null,
  HeroMoveDirection = { left: 0, right: 0, forward: 0, back: 0 };
const STATE = { DISABLE_DEACTIVATION: 4 };
//@deveshj48 add the collision configuration here -> kniematic objects and what nnot

let collectible1Object = null, //put here if want to make the object global
  collectible2Object = null;

let colGroupBall = 2, colGroupChar = 5, colGroupCollectible = 3, colGroupBlock = 1, colGroupTree = 4, colGroupModel=6; //collision purposes

let collectCounter;

let cbContactPairResult, blockPlane, ball, collectible1;
let cbContactResult;
let isCollection1Present, isCollection2Present;

var mapCamera,
  mapWidth = 240,
  mapHeight = 160;
//Ammojs Initialization
Ammo().then(start);

function start() {
  tmpTrans = new Ammo.btTransform();
  collectCounter = 0;

  setupPhysicsWorld();
  setupGraphics();

  for (var i = 0; i < 70; i++) {
    createCollectible1();
  }
  // for(var i=0;i<15;i++){
  //   createCollectible1();
  // } 
  // createCollectible1();
  // createCollectible2();
  // isCollection1Present = true;
  // isCollection2Present = true;

  createBlock();
  createBall();
  loadCharacter();

  Tree = new StaticModel("./resources/models/Tree.glb");
  
  for (var i = 0; i < 20; i++) {
    Tree.createModel({posY:5, colShapeScaleY: 3});
  }
  // for (var i = 0; i < 5; i++) {
  //   createRock()
  // }

  Bush = new StaticModel("./resources/models/island_bush_1.glb");

  for (var i = 0; i < 8; i++) {
    Bush.createModel();
  }

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
  camera.position.set(0, 15, 50);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

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
  camera.add(mapCamera);
  
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

  let d = 200;

  dirLight.shadow.camera.left = -d;
  dirLight.shadow.camera.right = d;
  dirLight.shadow.camera.top = d;
  dirLight.shadow.camera.bottom = -d;

  dirLight.shadow.camera.far = 13500;

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // // Orbit Control (Mouse Rotation and Zoom)
  //   // Orbit Controls
  //   const controls = new THREE.OrbitControls(
  //     camera, renderer.domElement);
  //   controls.target.set(0, 20, 0);
  //   controls.update();

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
  camera.lookAt(ballObject.position);
  updatePhysics(deltaTime);

  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  isCollect(); //handles cllectibles
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
  
  

  // if ((Math.abs(ballObject.position.getComponent(0) - collectible1Object.position.getComponent(0)) <= 2) && (Math.abs(ballObject.position.getComponent(2) - collectible1Object.position.getComponent(2)) <=2) && isCollection1Present){ //change
  //   scene.remove(collectible1Object); //PROBLEM: shape is still there, just hidden. probably not deleting collision shape that is wrapped around shape. 
  //   physicsWorld.removeRigidBody( collectible1Object.userData.physicsBody );
  //   collectCounter++;
  //   console.log(collectCounter); //kinda works
  //   isCollection1Present = false;

  // //   //createFont();

  // //   //may need to remove the object from rigidbodies array.
  // }

  // if ((Math.abs(ballObject.position.getComponent(0) - collectible2Object.position.getComponent(0)) <= 2) && (Math.abs(ballObject.position.getComponent(2) - collectible2Object.position.getComponent(2)) <=2) && isCollection2Present){ 
  //     scene.remove(collectible2Object); //PROBLEM: shape is still there, just hidden. probably not deleting collision shape that is wrapped around shape. 
  //     physicsWorld.removeRigidBody( collectible2Object.userData.physicsBody );
  //     //make sound
  //     //add to counter to collect however many collectibles there are
  //     collectCounter++;
  //     //createFont();
  //     console.log(collectCounter);
  //     isCollection2Present = false;
  //}
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
      jump(); //get to work simultaneously with movement, ie, be able to jump while a movement key is pressed
      break;

    case 77: //m
      checkContact(); //shows what the ball collides with
      break;

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

function createFont() {
  // const loader = new THREE.FontLoader();
  // loader.load('./fonts/Merriweather Sans_Regular.json', function (font: THREE.Font)){
  //   const geometry = new THREE.TextGeometry("testing", {
  //     font: font,
  //     size: 6,
  //     height: 2,

  //   })

  //   const textMesh = new THREE.Mesh(geometry, [
  //     new THREE.MeshPhongMaterial({color: 0xad4000}), //front
  //     new THREE.MeshPhongMaterial({color:0x5c2301}) //side
  //   ])

  //   textMesh.castShadow = true;
  //   textMesh.position.y += 15
  //   textMesh.position.z -= 40
  //   textMesh.position.x = -8
  //   textMesh.position.y += -0.50
  //   scene.add(textMesh);

  // }

  var text2 = document.createElement("div");
  text2.style.position = "absolute";
  //text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
  text2.style.width = 100;
  text2.style.height = 100;
  //text2.style.backgroundColor = "blue";
  text2.innerHTML = "";
  text2.innerHTML = collectCounter;
  text2.style.top = 200 + "px";
  text2.style.left = 200 + "px";
  //document.body.innerHTML = '';
  document.body.appendChild(text2);
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

  physicsWorld.addRigidBody(body, colGroupBall, colGroupChar|colGroupBlock|colGroupTree|colGroupCollectible|colGroupModel);

  ball.userData.physicsBody = body;
  rigidBodies.push(ball);
  body.threeObject = ball;
}

function createGrass() {
  let pos = { x: 0, y: 0, z: 0 };
  let quat = { x: 0, y: 0, z: 0, w: 1 };
  let mass = 0;

  var loader = new THREE.GLTFLoader();
  loader.load(
    "./resources/models/enchantedforest_grass_2.glb",
    function (gltf) {
      gltf.scene.scale.set(4, 4, 4);
      gltf.scene.position.set(
        Math.floor(Math.random() * (245 + 1)),
          2,
        Math.floor(Math.random() * (245 + 1))
      );
      gltf.scene.traverse(function (node) {
        if (node.isMesh) {
          node.castShadow = true;
        }
      });
      const grass = gltf.scene;

      scene.add(grass);
      //Ammojs Section -> physics section
      let transform = new Ammo.btTransform();
      transform.setIdentity();
      transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
      transform.setRotation(
        new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
      );

      let motionState = new Ammo.btDefaultMotionState(transform);

      let localInertia = new Ammo.btVector3(0, 0, 0);
      let verticesPos = grass.geometry.getAttribute("position"),
        array;
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
        (grass.geometry.verticesNeedUpdate = true)
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

      grass.userData.physicsBody = body;
      rigidBodies.push(grass);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
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
      let verticesPos = model.geometry.getAttribute("position"),
        array;
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

function moveBall() {
  //this goes in renderframe()

  let scalingFactor = 20;

  let moveX = moveDirection.right - moveDirection.left;
  let moveZ = moveDirection.back - moveDirection.forward;
  let moveY = moveDirection.up - moveDirection.down * 2;

  if (moveX == 0 && moveY == 0 && moveZ == 0) return;

  let resultantImpulse = new Ammo.btVector3(moveX, moveY, moveZ);
  resultantImpulse.op_mul(scalingFactor);

  let physicsBody = ballObject.userData.physicsBody;
  physicsBody.setLinearVelocity(resultantImpulse);
}

//collectible items (make a class in future)
function createCollectible1() {
  let pos = { x: 0, y: 2, z: 0 };
  let scale = { x: 1, y: 1, z: 1 };
  let quat = { x: 0, y: 0, z: 0, w: 1 };
  let mass = 0;

  //threeJS Section
  collectible1 = (collectible1Object = new THREE.Mesh(
    new THREE.BoxBufferGeometry(),
    new THREE.MeshPhongMaterial({ color: "blue" })
  ));

  collectible1.position.set(Math.floor(Math.random() * (245 + 1)),2,-Math.floor(Math.random() * (245 + 1)));
  //collectible1.position.set(Math.floor(Math.random()*(100)),3,Math.floor(Math.random()*(100)));
  //collectible1.position.set(pos.x, pos.y, pos.z);
  collectible1.scale.set(scale.x, scale.y, scale.z);

  collectible1.castShadow = true;
  collectible1.receiveShadow = true;

  scene.add(collectible1);
  collectible1.userData.tag = "collectible1";

  //Ammojs Section
  let transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
  transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
  let motionState = new Ammo.btDefaultMotionState(transform);

  let colShape = new Ammo.btBoxShape(
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

  physicsWorld.addRigidBody( body, colGroupCollectible, colGroupBall);

  collectible1.userData.physicsBody = body;
  rigidBodies.push(collectible1);
  body.threeObject = collectible1;
}

function createCollectible2() {
  let pos = { x: 15, y: 3, z: 40 };
  let scale = { x: 1, y: 1, z: 1 };
  let quat = { x: 0, y: 0, z: 0, w: 1 };
  let mass = 0;

  //threeJS Section
  let collectible2 = (collectible2Object = new THREE.Mesh(
    new THREE.BoxBufferGeometry(),
    new THREE.MeshPhongMaterial({ color: "blue" })
  ));

  collectible2.position.set(pos.x, pos.y, pos.z);
  collectible2.scale.set(scale.x, scale.y, scale.z);

  collectible2.castShadow = true;
  collectible2.receiveShadow = true;

  scene.add(collectible2);

  //Ammojs Section
  let transform = new Ammo.btTransform();
  transform.setIdentity();
  transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
  transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
  let motionState = new Ammo.btDefaultMotionState(transform);

  let colShape = new Ammo.btBoxShape(
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

  //physicsWorld.addRigidBody( body, colGroupCollectible, colGroupBlock);
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

function setupContactPairResultCallback(){

  cbContactPairResult = new Ammo.ConcreteContactResultCallback();

  cbContactPairResult.hasContact = false;

  cbContactPairResult.addSingleResult = function (
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

    this.hasContact = true;
  };
}

function jump() {
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

function isCollect(){

  cbContactPairResult.hasContact = false;

  physicsWorld.contactPairTest(ball.userData.physicsBody, collectible1.userData.physicsBody, cbContactPairResult);

  if( !cbContactPairResult.hasContact ) return;

  // scene.remove(collectible1); //PROBLEM: shape is still there, just hidden. probably not deleting collision shape that is wrapped around shape. 
  // physicsWorld.removeRigidBody( collectible1.userData.physicsBody );
  collectCounter++;
  console.log(collectCounter);

}

function moveHero() {
  //this goes in renderframe()

  let scalingFactor = 20;

  let moveX = HeroMoveDirection.right - HeroMoveDirection.left;
  let moveZ = HeroMoveDirection.back - HeroMoveDirection.forward;
  let moveY = 0; //0 because we not doing up-down movement

  if (moveX == 0 && moveY == 0 && moveZ == 0) return;

  let resultantImpulse = new Ammo.btVector3(moveX, moveY, moveZ);
  resultantImpulse.op_mul(scalingFactor);

  let physicsBody = heroObject.userData.physicsBody;
  physicsBody.setLinearVelocity(resultantImpulse);
}

function updatePhysics(deltaTime) {
  // Step world
  physicsWorld.stepSimulation(deltaTime, 10);

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
      objThree.position.set(p.x(), p.y(), p.z());
      objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());

      // First Person
      if (firstPerson == true) {
        // Perspective from objects eyes
        camera.position.set(p.x(), p.y(), p.z());

        // Look 100 units ahead
        camera.lookAt(p.x(), p.y(), p.z() - 100);

        // Temporarily change camera view (still in first person)
        if (lookLeft == true) {
          camera.lookAt(p.x() - 100, p.y(), p.z());
        } else if (lookRight == true) {
          camera.lookAt(p.x() + 100, p.y(), p.z());
        } else if (lookBack == true) {
          camera.lookAt(p.x(), p.y(), p.z() + 100);
        }
      }

      // Third Person
      else {
        // Perspective from behind object and slightly above
        camera.position.set(p.x(), p.y() + 8, p.z() + 15);

        // Look slightly above object
        camera.lookAt(p.x(), p.y() + 5, p.z());

        // Temporarily change camera view (still in first person)
        if (lookLeft == true) {
          camera.position.set(p.x() + 10, p.y() + 5, p.z());
          camera.lookAt(p.x() - 100, p.y(), p.z());
        } else if (lookRight == true) {
          camera.position.set(p.x() - 10, p.y() + 5, p.z());
          camera.lookAt(p.x() + 100, p.y(), p.z());
        } else if (lookBack == true) {
          camera.position.set(p.x(), p.y() + 5, p.z() - 10);
          camera.lookAt(p.x(), p.y(), p.z() + 100);
        }
      }
    }
  //}
}
