//variable declaration section
let physicsWorld,
  scene,
  camera,
  renderer,
  rigidBodies = [],
  tmpTrans = null;

let ballObject = null,
  moveDirection = { left: 0, right: 0, forward: 0, back: 0 }; //used to hold the respective directional key (WASD)

let heroObject = null,
  HeroMoveDirection = { left: 0, right: 0, forward: 0, back: 0 };
const STATE = { DISABLE_DEACTIVATION: 4 };

//Ammojs Initialization
Ammo().then(start);

function start() {
  tmpTrans = new Ammo.btTransform();

  setupPhysicsWorld();

  setupGraphics();
  createBlock();
  createBall();
  loadCharacter();
  loadTree();

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
  physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));
}

function setupGraphics() {
  //create clock for timing
  clock = new THREE.Clock();

  //create the scene
  scene = new THREE.Scene();
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
  camera.position.set(0, 15, 30);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

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

  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;

  let d = 50;

  dirLight.shadow.camera.left = -d;
  dirLight.shadow.camera.right = d;
  dirLight.shadow.camera.top = d;
  dirLight.shadow.camera.bottom = -d;

  dirLight.shadow.camera.far = 13500;

  //Setup the renderer
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setClearColor(0x000, 0);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  renderer.gammaInput = true;
  renderer.gammaOutput = true;

  renderer.shadowMap.enabled = true;
}

function renderFrame() {
  let deltaTime = clock.getDelta();

  moveBall();

  camera.lookAt(ballObject.position);
  updatePhysics(deltaTime);

  renderer.render(scene, camera);

  requestAnimationFrame(renderFrame);
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
      break;

    case 83: //S: BACK
      moveDirection.back = 1;
      break;

    case 65: //A: LEFT
      moveDirection.left = 1;
      break;

    case 68: //D: RIGHT
      moveDirection.right = 1;
      break;
  }
}
function handleKeyUp(event) {
  let keyCode = event.keyCode;

  switch (keyCode) {
    case 87: //FORWARD
      moveDirection.forward = 0;
      break;

    case 83: //BACK
      moveDirection.back = 0;
      break;

    case 65: //LEFT
      moveDirection.left = 0;
      break;

    case 68: //RIGHT
      moveDirection.right = 0;
      break;
  }
}

function createBlock() {
  let pos = { x: 0, y: 0, z: 0 };
  let scale = { x: 500, y: 2, z: 500 };
  let quat = { x: 0, y: 0, z: 0, w: 1 };
  let mass = 0;

  //threeJS Section
  const grass = new THREE.TextureLoader().load("./resources/grass.jpg");
  let blockPlane = new THREE.Mesh(
    new THREE.BoxBufferGeometry(),
    new THREE.MeshPhongMaterial({ map: grass })
  );

  blockPlane.position.set(pos.x, pos.y, pos.z);
  blockPlane.scale.set(scale.x, scale.y, scale.z);

  blockPlane.castShadow = true;
  blockPlane.receiveShadow = true;

  scene.add(blockPlane);

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

  physicsWorld.addRigidBody(body);
}

function createBall() {
  let pos = { x: 0, y: 4, z: 0 };
  let radius = 2;
  let quat = { x: 0, y: 0, z: 0, w: 1 };
  let mass = 1;

  //threeJS Section
  let ball = (ballObject = new THREE.Mesh(
    new THREE.DodecahedronGeometry(radius),
    new THREE.MeshPhongMaterial({ color: 0xff0505 })
  ));

  ball.position.set(pos.x, pos.y, pos.z);

  ball.castShadow = true;
  ball.receiveShadow = true;

  scene.add(ball);

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

  physicsWorld.addRigidBody(body);

  ball.userData.physicsBody = body;
  rigidBodies.push(ball);
}

function loadCharacter() {
  let pos = { x: 0, y: 0, z: 0 };
  let quat = { x: 0, y: 0, z: 0, w: 1 };
  let mass = 0;

  var loader = new THREE.GLTFLoader();
  loader.load(
    "./resources/models/Yasuo.glb",
    function (gltf) {
      gltf.scene.scale.set(10, 10, 10);
      gltf.scene.translateY(1);
      const yasuo = gltf.scene;
      yasuo.castShadow = true;
      yasuo.receiveShadow = true;
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
      let verticesPos = yasuo.geometry.getAttribute("position"),
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
        (yasuo.geometry.verticesNeedUpdate = true)
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

      yasuo.userData.physicsBody = body;
      rigidBodies.push(yasuo);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
}

function loadTree() {
  let pos = { x: 200, y: -40, z: 0 };
  let scale = { x: 30, y: 30, z: 30 };
  let quat = { x: 0, y: 0, z: 0, w: 1 };
  let mass = 0;

  var loader = new THREE.GLTFLoader();
  loader.load(
    "./resources/models/Tree.glb",
    function (gltf) {
      gltf.scene.scale.set(25, 25, 25);
      gltf.scene.translateX(30);
      gltf.scene.translateY(30);
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
  let moveY = 0; //0 because we not doing up-down movement

  if (moveX == 0 && moveY == 0 && moveZ == 0) return;

  let resultantImpulse = new Ammo.btVector3(moveX, moveY, moveZ);
  resultantImpulse.op_mul(scalingFactor);

  let physicsBody = ballObject.userData.physicsBody;
  physicsBody.setLinearVelocity(resultantImpulse);
}

function updatePhysics(deltaTime) {
  // Step world
  physicsWorld.stepSimulation(deltaTime, 10);

  // Update rigid bodies
  for (let i = 0; i < rigidBodies.length; i++) {
    let objThree = rigidBodies[i];
    let objAmmo = objThree.userData.physicsBody;
    let ms = objAmmo.getMotionState();
    if (ms) {
      ms.getWorldTransform(tmpTrans);
      let p = tmpTrans.getOrigin();
      let q = tmpTrans.getRotation();
      objThree.position.set(p.x(), p.y(), p.z());
      objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
    }
  }
}
