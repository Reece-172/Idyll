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

// Ball Graphics / THREE Object
let ballObject = null,
  moveDirection = { left: 0, right: 0, forward: 0, back: 0, up: 0 }; //used to hold the respective directional key (WASD)

// Variable to store first person / third person state
// Handling "firstPersonPressed" differently from firstPerson so
// camera change can be applied immediately using "orbitControls.update()"
// in "updatePhysics()". If left out, change only happens on mouse click.
// If treated depending on firstPerson variable, then "orbitControls.update()"
// is run on every "updatePhysics()" call, which causes erratic camera / character movement
let firstPerson = false, firstPersonPressed = false;

// Control Temp data
var orbitControls;
rollDirection = new THREE.Vector3();
rotateAngle = new THREE.Vector3(0, 1, 0);

// Platform related
let platform1;
let platforms = [];

// Levels Completed
let levels_completed = { one: false, two: false, three: false };
let mission_active = 0;


// Array of NPC's where the level is equivalent to NPC index + 1
let NPCs = [];


let NPCObject = null
//HeroMoveDirection = { left: 0, right: 0, forward: 0, back: 0 };
const STATE = { DISABLE_DEACTIVATION: 4 };
//@deveshj48 add the collision configuration here -> kniematic objects and what nnot

// let collectible1Object = null, //put here if want to make the object global
//   collectible2Object = null;

let colGroupBall = 2, colGroupNPC = 5, colGroupCollectible = 3, colGroupBlock = 1, colGroupTree = 4, colGroupModel = 6, colGroupPlatform = 7; //collision purposes

let collectCounter;

let cbContactPairResult, blockPlane, ball, collectible1, yasuo;
let cbContactResult;
const GAMESTATE = {
  PAUSED: 0,
  RUNNING: 1,
  MENU: 2,
  GAMEOVER: 3,
};//for loading screen


const MISSIONSTATE = { //didn't put mission state under GAMESTATE because we need the game to be in state RUNNING to be in a mission
  FREEROAM: 0,
  MISSION: 1
}

let points; //object that displays the points 


window.addEventListener('load', function () {
  var loadingScreen = document.getElementById('loadingScreen');
  document.body.removeChild(loadingScreen);
});


//for fps display
(function () { var script = document.createElement('script'); script.onload = function () { var stats = new Stats(); document.body.appendChild(stats.dom); requestAnimationFrame(function loop() { stats.update(); requestAnimationFrame(loop) }); }; script.src = '//mrdoob.github.io/stats.js/build/stats.min.js'; document.head.appendChild(script); })()

let collectibles = [];

let npcContact = false; //boolean to check if player made contact with NPC

var mapCamera,
  mapWidth = 240,
  mapHeight = 160;
let isTimeOut = false;
let myTimer;
timerDisplay = document.querySelector('#time');


//Ammojs Initialization
Ammo().then(start);
function start() {
  tmpTrans = new Ammo.btTransform();
  collectCounter = 0;
  this.gamestate = GAMESTATE.RUNNING;



  freeroam();

  setupPhysicsWorld();
  setupGraphics();

  createBlock();
  createBall();

  loadNPC1();
  loadNPC2();
  loadNPC3();
  

  // let NPC1 = new NPC("./resources/models/Yasuo.glb");
  // NPC1.createNPC();
  // NPCs.push(NPC1);

  createWorld();


  // for (var i = 0; i < 50; i++) {
  // createTree_2();
  // }
  // for (var i = 0; i < 50; i++) {
  //   createTree_3();
  // }

  //createOcean();
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
  scene.fog = new THREE.Fog(0xffffff, 0.015, 1500);
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

  //background music plays when the game is running
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

  window.addEventListener('resize',function(){
    renderer.setSize(window.innerWidth,window.innerHeight);
    camera.aspect=window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
  });

  // Controls -> mouse movement
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

  // Move the ball
  moveBall();

  //moveHero();

  // Change camera focus according to whether in 1st person or 3rd person mode
  if (firstPerson == true) {
    camera.lookAt(ballObject.position.x, ballObject.position.y + 3, ballObject.position.z);
  } else {
    camera.lookAt(ballObject.position);
  }

  updatePhysics(deltaTime);

  //pause
  if (this.gamestate === GAMESTATE.PAUSED) {
    document.getElementById("Game Paused").style.visibility = "visible";
  }
  else {
    document.getElementById("Game Paused").style.visibility = "hidden";
  }

  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);

  //count collectibles
  if (this.missionstate === MISSIONSTATE.MISSION) { //count and check collisions with collectibles only if the player is doing mission

    //handles collectibles
    if (collectibles.length !== 0) {
      isCollect();
    }

    points = document.getElementById('PointsEl');
    points.innerHTML = collectCounter; //updates points on screen
  }

  // if (this.missionstate === MISSIONSTATE.FREEROAM){
  //   isContactNPC;

  // }

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

    case 70: //F: Toggle First Person
      if (firstPerson == false) {
        firstPerson = true;
      } else {
        firstPerson = false;
      }
      firstPersonPressed = true;
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
      //console.log(this.missionstate);
      break;

    case 80: //p
      TogglePause();
      break;

    case 66: //b
      isContactNPC(); //checks contact with NPC
      break;

    case 75: //k. TEMPORARY. USED TO TEST QUITTING MISSION

      if (this.missionstate === MISSIONSTATE.MISSION) { //only if player is currently in a mission, then they can quit a mission
        quitMission();
      }

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

    case 70: // (First Person Button, "F", Pressed --> Change Camera)
      firstPersonPressed = false;
      break;

    case 32: //space bar
      moveDirection.up = 0;
  }
}

function startTimer(totalTime) {//https://stackoverflow.com/questions/20618355/how-to-write-a-countdown-timer-in-javascript


  let timerDisplay = document.querySelector('#time');
  timerDisplay.style.display = "flex";
  clearInterval(myTimer);

  myTimer = setInterval(function () {


    if (totalTime > 0) {

      isTimeOut = false;
      //myTimer = setTimeout(timer, 1000);
      isTimerOn = true;
      totalTime--;
      //calculate the minutes and seconds
      minutes = (totalTime / 60) | 0;
      seconds = (totalTime % 60) | 0;
      //display the result -> formats it into a proper timer string
      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;

      timerDisplay.textContent = minutes + ":" + seconds; //display the timer on the HTML created element

      //collectibles
      if (collectibles.length == 0) {

        // Update Level Completion Array
        levels_completed.one = true;
        mission_active = 0;

        isTimeOut = true;
        console.log("you have won");
        totalTime = 0;
        //clearInterval(myTimer);
        //create a pop up to give player some story
        var task = document.getElementById('completedMission');
        task.style.display='flex';

        //button to confirm
        var btnOk = document.getElementById('Okay');

        btnOk.onclick = function () {
          freeroam();
          task.style.display='none'; 
  
        }

          
        return;

      }
    }
    else{ //if timer is 0

      isTimeOut = true;
      totalTime = 0;

      let boolMsg
      //TO DO: Game Over screen -> mission failed with restart/exit button
      //console.log("you have failed (timer function)");

      if (collectibles.length > 0) {
        console.log("you have lost");
        freeroam();

        //create a pop up to give player some story
        var task = document.getElementById('failedMission');
        task.style.display='flex';


        //button to retry
        var btnOk = document.getElementById('Retry');
        btnOk.onclick = function () { 
          console.log("retry mission");
          startMission(mission_active);
        
          task.style.display='none';

        }

        //button to quit mission and go back to normal
        var btnCancel = document.getElementById('Quit_Mission');

        btnCancel.onclick = function () {
          //freeroam(); 
          task.style.display='none' ;
        } 


        
        return;
      }
      

    }

    
  }, 1000);


  return;
  // if (isTimeOut == false){
  //   timer();
    
  // }
  // else{
  //   clearTimeout(timer);
  //   totalTime = initTime;
  //  
  // }

}

function createBlock() {
  let pos = { x: 0, y: 0, z: 0 };
  let scale = { x: 700, y: 2, z: 700 };
  let quat = { x: 0, y: 0, z: 0, w: 1 };
  let mass = 0;

  //threeJS Section
  const grass = new THREE.TextureLoader().load("./resources/grass.jpg");
  grass.wrapS = THREE.RepeatWrapping;
  grass.wrapT = THREE.RepeatWrapping;
  grass.repeat.set(8, 8);
  blockPlane = new THREE.Mesh(
    new THREE.BoxBufferGeometry(),
    new THREE.MeshLambertMaterial({ map: grass })
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
    colGroupBall | colGroupNPC | colGroupCollectible | colGroupPlatform
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

  physicsWorld.addRigidBody(body, colGroupBall, colGroupNPC | colGroupBlock | colGroupTree | colGroupModel);

  ball.userData.physicsBody = body;
  rigidBodies.push(ball);
  body.threeObject = ball;
}

// Create a platform with a collectible on it
function createCollectablePlatform(pos_x, pos_y, pos_z, collectible_colour, obj_texture) {

  // createPlatform() method is overridable with x-y-z
  // coordinates (E.g. createPlatform(10,5,-30))
  platform1 = new JumpPlatform();
  platform1.createPlatform({ posX: pos_x, posY: pos_y, posZ: pos_z , object_texture: obj_texture});
  platforms.push(platform1);

  // createCollectible() method is overridable with x-y-z
  // coordinates (E.g. createCollectible(posX: 10, posY: 2, posZ: -30))
  collectible1 = new Collectible();
  collectible1.createCollectible({ posX: pos_x, posY: pos_y + 2, posZ: pos_z, collectible_colour });
  collectibles.push(collectible1);

}

// Platforms and Collectibles to load for level 1 (easy)
function loadLevel_1_Objective() {

  obj_texture = "image2.jpg";

  // NOTE: Total Collectibles is n + (collectible_platform_coordinates.length / 3)
  n = 5;
  collectible_colour = "gold";

  // Arrays of all the platform locations
  // E.g. [Platform1_x, Platform1_y, Platform1_z, Platform2_x, Platform2_y, Platform2_z,]...
  all_platform_coordinates = [20, 5, -80];
  collectible_platform_coordinates = [20, 10, -100, 40, 5, -40, -20, 5, -120];


  for (var i = 0; i < n; i++) { //add high and low collectibles so user has to jump
    // createCollectible() method is overridable with x-y-z
    // coordinates (E.g. createCollectible(posX: 10, posY: 2, posZ: -30))
    // and colour
    collectible1 = new Collectible();
    collectible1.createCollectible({ collectible_colour });
    collectibles.push(collectible1);
  }

  for (var i = 0; i < all_platform_coordinates.length; i += 3) {
    // createPlatform() method is overridable with x-y-z
    // coordinates (E.g. createPlatform(10,5,-30))
    platform1 = new JumpPlatform();
    platform1.createPlatform({ posX: all_platform_coordinates[i], posY: all_platform_coordinates[i + 1], posZ: all_platform_coordinates[i + 2], object_texture: obj_texture});
    platforms.push(platform1);
  }

  for (var i = 0; i < collectible_platform_coordinates.length; i += 3) {
    // Setup Platform with Collectiable on it
    // Parameters: x-y-z coordinates of platform, collectible colour
    createCollectablePlatform(collectible_platform_coordinates[i], collectible_platform_coordinates[i + 1], collectible_platform_coordinates[i + 2], collectible_colour, obj_texture);
  }
}

// Platforms and Collectibles to load for level 2 (intermediate)
function loadLevel_2_Objective() {

  obj_texture = "image3.webp";

  // NOTE: Total Collectibles is n + (collectible_platform_coordinates.length / 3)
  n = 10;
  collectible_colour = "pink";

  // Array of all the platform locations
  // E.g. [Platform1_x, Platform1_y, Platform1_z, Platform2_x, Platform2_y, Platform2_z,]...
  all_platform_coordinates = [-20, 5, -20, -30, 10, -40];
  collectible_platform_coordinates = [-25, 15, -60, -15, 20, -80, 0, 15, -120];


  for (var i = 0; i < n; i++) { //add high and low collectibles so user has to jump
    // createCollectible() method is overridable with x-y-z
    // coordinates (E.g. createCollectible(posX: 10, posY: 2, posZ: -30))
    // and colour
    collectible1 = new Collectible();
    collectible1.createCollectible({ collectible_colour });
    collectibles.push(collectible1);
  }

  for (var i = 0; i < all_platform_coordinates.length; i += 3) {
    // createPlatform() method is overridable with x-y-z
    // coordinates (E.g. createPlatform(10,5,-30))
    platform1 = new JumpPlatform();
    platform1.createPlatform({ posX: all_platform_coordinates[i], posY: all_platform_coordinates[i + 1], posZ: all_platform_coordinates[i + 2], object_texture: obj_texture});
    platforms.push(platform1);
  }

  for (var i = 0; i < collectible_platform_coordinates.length; i += 3) {
    // Setup Platform with Collectiable on it
    // Parameters: x-y-z coordinates of platform, collectible colour
    createCollectablePlatform(collectible_platform_coordinates[i], collectible_platform_coordinates[i + 1], collectible_platform_coordinates[i + 2], collectible_colour, obj_texture);
  }

}

// Platforms and Collectibles to load for level 3 (advanced)
function loadLevel_3_Objective() {

  obj_texture = "image4.jpg";

  // NOTE: Total Collectibles is n + (collectible_platform_coordinates.length / 3)
  n = 10;
  collectible_colour = "red";

  // Array of all the platform locations
  // E.g. [Platform1_x, Platform1_y, Platform1_z, Platform2_x, Platform2_y, Platform2_z,]...
  all_platform_coordinates = [-20, 5, -20, -30, 10, -40, -30, 15, -60, -40, 15, -60, -50, 15, -60, -60, 15, -60, -70, 15, -60, -70, 15, -50, -70, 20, -30,
  -65, 25, -10, -55, 30, 10, -35, 35, 10];
  collectible_platform_coordinates = [-15, 20, -80, 0, 15, -120, -15, 40, 10, -15, 45, 30];


  for (var i = 0; i < 10; i++) { //add high and low collectibles so user has to jump
    // createCollectible() method is overridable with x-y-z
    // coordinates (E.g. createCollectible(posX: 10, posY: 2, posZ: -30))
    // and colour
    collectible1 = new Collectible();
    collectible1.createCollectible({ collectible_colour });
    collectibles.push(collectible1);
  }

  for (var i = 0; i < all_platform_coordinates.length; i += 3) {
    // createPlatform() method is overridable with x-y-z
    // coordinates (E.g. createPlatform(10,5,-30))
    platform1 = new JumpPlatform();
    platform1.createPlatform({ posX: all_platform_coordinates[i], posY: all_platform_coordinates[i + 1], posZ: all_platform_coordinates[i + 2], object_texture: obj_texture });
    platforms.push(platform1);
  }

  for (var i = 0; i < collectible_platform_coordinates.length; i += 3) {
    // Setup Platform with Collectiable on it
    // Parameters: x-y-z coordinates of platform, collectible colour
    createCollectablePlatform(collectible_platform_coordinates[i], collectible_platform_coordinates[i + 1], collectible_platform_coordinates[i + 2], collectible_colour, obj_texture);
  }

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
  if (this.gamestate === GAMESTATE.PAUSED) {
    return;
  }
  let scalingFactor = 20;

  let moveX = moveDirection.right - moveDirection.left;
  let moveZ = moveDirection.back - moveDirection.forward;
  let moveY = moveDirection.up;


  if (moveX == 0 && moveY == 0 && moveZ == 0) return;

  // ----- Check Contact before doing any move calculation (start) -----
  cbContactPairResult.hasContact = false;

  physicsWorld.contactPairTest(
    ball.userData.physicsBody,
    blockPlane.userData.physicsBody,
    cbContactPairResult
  );

  for (var i = 0; i < platforms.length; i++) {
    physicsWorld.contactPairTest(
      ball.userData.physicsBody,
      platforms[i].getPlatformObject().userData.physicsBody,
      cbContactPairResult
    );
  }

  if (!cbContactPairResult.hasContact) return;
  // ----- Check Contact before doing any move calculation (end) -----


  var dirOffset = directionOffset();

  camera.getWorldDirection(rollDirection);
  rollDirection.y = 0;

  if (moveDirection.up == true) {
    rollDirection.y = 1;
  }

  rollDirection.normalize();
  rollDirection.applyAxisAngle(rotateAngle, dirOffset);


  let resultantImpulse = new Ammo.btVector3(rollDirection.x, rollDirection.y, rollDirection.z);
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


function isCollect() { //checking the collectibles array if any of the collectibles were in contact with the ball. If so, remove collectible from scene

  let i = 0;


  while (true) {
    cbContactPairResult.hasContact = false;
    if (i >= collectibles.length) return;
    physicsWorld.contactPairTest(ball.userData.physicsBody, collectibles[i].getCollectibleObject().userData.physicsBody, cbContactPairResult); //perform a test to see if there is contact 
    if (cbContactPairResult.hasContact) { //if there is contact between the ball and collectible object

      collectCounter++;
      const listener = new THREE.AudioListener();
      camera.add(listener);


      const loadAudio = new THREE.AudioLoader();

      const audio = new THREE.Audio(listener);

      //background music plays when the game is running
      loadAudio.load("./resources/collectible.wav", function (buffer) {
        audio.setBuffer(buffer);
        audio.setLoop(false);
        audio.setVolume(0.8);
        audio.play();
      });
      scene.add(audio);

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

function TogglePause() {
  if (this.gamestate === GAMESTATE.PAUSED) {
    this.gamestate = GAMESTATE.RUNNING;

  }
  else {
    this.gamestate = GAMESTATE.PAUSED;
    //pause timer


  }
}

function Menu() {

  document.getElementById("Menu_Buttons").style.display = 'flex';
}

function Resume() {
  //window.location.href="index.html";
  document.getElementById("Menu_Buttons").style.display = 'none';

}

function Controls() {
  const controls = document.getElementById("controlsScreen");
  controls.style.display = 'flex';
  //set controls div to visible

}
function Back() {
  const controls = document.getElementById("controlsScreen");
  controls.style.display = 'none';
}
function Quit() {
  location.reload();

}

function Begin(){
  const landing_page= document.getElementById('landingScreen');
  landing_page.style.display='none';
  const menu_button=document.getElementById('menu');
  menu_button.style.display='flex';

}

function setupContactPairResultCallback() {

  cbContactPairResult = new Ammo.ConcreteContactResultCallback();

  cbContactPairResult.hasContact = false;

  cbContactPairResult.addSingleResult = function (cp, colObj0Wrap, partId0, index0, colObj1Wrap, partId1, index1) {

    let contactPoint = Ammo.wrapPointer(cp, Ammo.btManifoldPoint);

    const distance = contactPoint.getDistance();

    if (distance > 0.5) return;

    this.hasContact = true;
  };
}


function isContactNPC() {

  console.log("There are " + NPCs.length + " NPCs");

  for (let i = 0; i < NPCs.length; i++) {

    cbContactPairResult.hasContact = false;

    physicsWorld.contactPairTest(
      ball.userData.physicsBody,
      //NPCs[i].getNPCObject().userData.physicsBody,
      NPCs[i].userData.physicsBody,
      cbContactPairResult
    );

    npcContact = false;

    if (cbContactPairResult.hasContact) {

      npcContact = true;

    if (this.missionstate !== MISSIONSTATE.MISSION) { //if we are not in a mission, then start a mission
      mission_active = i+1;
      startMission(mission_active);
    }
    else {
      const duringMission=document.getElementById('duringMission'); //make this display on screen
      duringMission.style.display='flex'
      var Okaybtn=document.getElementById('Ok');
      Okaybtn.onclick = function () { 
        duringMission.style.display='none'; 
      }
    }

  }

  }


}

function startMission(mission_level){
  const quit_Button=document.getElementById('Quit_Mission_Button');
  
  
  //create a pop up to give player some story
  const task = document.getElementById('task');
  task.style.display='flex';
  // task.style.position = 'absolute';
  // task.style.zIndex = 1;  
  // task.style.width = 600;
  // task.style.height = 200;
  // task.style.backgroundColor = "#242424";
  // task.style.opacity = "0.9";
  // task.innerHTML = "Hello there young traveller. I seem to have misplaced my things. Please help me find them<br><br>";
  // task.style.color = "white";
  // task.style.top = 200 + 'px';
  // task.style.left = 200 + 'px';

  //button to confirm
  var btnOk = document.getElementById('Accept');
  btnOk.onclick = function () { 
    console.log("mission started");
    quit_Button.style.display='flex';
    document.getElementById('Points').style.display='flex';

   
    collectCounter = 0; //reset counter 

    // let numCollectibles = 1;

    // for (var i = 0; i < numCollectibles; i++) { //add high and low collectibles so user has to jump
    //   collectible1 = new Collectible();
    //   collectible1.createCollectible();
    //   collectibles.push(collectible1);
    // }

    switch (mission_level) {

      case 1:
        console.log("Level 1 started")
        loadLevel_1_Objective();
        break;

      case 2:
        console.log("Level 2 started")
        loadLevel_2_Objective();
        break;

      case 3:
        console.log("Level 3 started")
        loadLevel_3_Objective();
        break;
    }

    //display points counter
    Mission();

    task.style.display='none';
    //start timer now 
  }

  //button to not accept mission and go back to normal
  var btnCancel = document.getElementById('Reject');
  btnCancel.onclick = function () { 
    task.style.display='none'; 
  }





}

function Mission() {

  this.missionstate = MISSIONSTATE.MISSION;

  let mission_timer = 10;

  switch(mission_active){

    case 1:
    mission_timer = 60;
      break;

    case 2:
    mission_timer = 90;
      break;

    case 3:
    mission_timer = 120;
      break;

  }



  startTimer(mission_timer);
  console.log("currently in a mission");

  //window.onload = function () { //this is how you set the timer

  //};


  // if ((isTimeOut == false) && (collectibles.length == 0)) {
  //   console.log("you have won");
  //   freeroam();

  // }
  // else if ((isTimeOut) && (collectibles.length > 0)) {
  //   console.log("you have failed");
  //   freeroam();

  // }
  // timer stuff here.
  // if (timer not run out) && (collectibles.length === 0){ 
  //  success  
  // }
  // else if (timer run out) && (collectibles.length > 0) {
  //        fail
  // popup to retry or quit
  // if quit then return to freeroam. call freeroam()
  // if retry then call startMission() again ??

  //} 


}

function quitMission() {


  //console.log("you have quit the mission")

  //pause timer

  this.gamestate = GAMESTATE.PAUSED; //pause game when dealing with popup

  //create a pop up to ask if user wants to quit mission
  var quitMission = document.getElementById('quitMission');
  quitMission.style.display='flex';


  //button to confirm quit
  var btnQuit = document.getElementById('Yes');
  btnQuit.onclick = function () { //if user wants to quit
    this.gamestate = GAMESTATE.RUNNING;
    document.getElementById('Points').style.display='none';
    console.log("mission quit");
    freeroam(); //return to freeroam gameplay
    quitMission.style.display='none';
    
  }


  //button to continue mission and ignore popup
  var btnNoQuit = document.getElementById('No');
  btnNoQuit.onclick = function () { //if user doesn't want to quit, carry on with mission
    this.gamestate = GAMESTATE.RUNNING;
    
    quitMission.style.display='none';
    document.getElementById('Menu_Buttons').style.display='none';
    //continue timer
  }






  //this.missionstate = MISSIONSTATE.FREEROAM;
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

    if(p.y() <= -10){
      console.log("Off Map");
      const game_over = document.getElementById("GameOverScreen");
      game_over.style.display = "flex";
    }else{

    objThree.position.set(p.x(), p.y(), p.z());
    objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
    }

  }
}

function arrayRemove(arr, value) {

  return arr.filter(function (element) {
    return element != value; //creates a new array, without the specific element
  });
}

function freeroam() {

  this.missionstate = MISSIONSTATE.FREEROAM;
  
  let timerDisplay = document.querySelector('#time');
  timerDisplay.style.display = "none";

  //remove timer
  //remove points counter

  //remove all collectibles
  if (collectibles.length > 0) {
    let i = 0; //don't have to keep increasing i because the 0th element will keep on being removed until array size is 0
    while (collectibles.length > 0) {
      physicsWorld.removeRigidBody(collectibles[i].getCollectibleObject().userData.physicsBody); //remove this rigid body from the physics world
      scene.remove(collectibles[i].getCollectibleObject()); //remove from scene
      rigidBodies = arrayRemove(rigidBodies, collectibles[i].getCollectibleObject()); //remove from rigidbodies array
      collectibles.splice(i, 1); //delete element from collectibles array
    }

  }

  if (platforms.length > 0) {
    let i = 0; //don't have to keep increasing i because the 0th element will keep on being removed until array size is 0
    while (platforms.length > 0) {
      physicsWorld.removeRigidBody(platforms[i].getPlatformObject().userData.physicsBody); //remove this rigid body from the physics world
      scene.remove(platforms[i].getPlatformObject()); //remove from scene
      rigidBodies = arrayRemove(rigidBodies, platforms[i].getPlatformObject()); //remove from rigidbodies array
      platforms.splice(i, 1); //delete element from collectibles array
    }

  }


  //delete platforms

  collectCounter = 0;



}
