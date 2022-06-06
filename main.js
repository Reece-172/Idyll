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
let lookLeft = false, lookRight = false, lookBack = false;

let heroObject = null,
  HeroMoveDirection = { left: 0, right: 0, forward: 0, back: 0 };
const STATE = { DISABLE_DEACTIVATION: 4 };
//@deveshj48 add the collision configuration here -> kniematic objects and what nnot

let collectible1Object = null, //put here if want to make the object global
  collectible2Object = null;

let colGroupBall = 2, colGroupChar = 5, colGroupCollectible = 3, colGroupBlock = 1, colGroupTree = 4; //collision purposes

let collectCounter;

let cbContactPairResult, blockPlane, ball;
let cbContactResult;
const GAMESTATE={
  PAUSED:0,
  RUNNING:1,
  MENU:2,
  GAMEOVER:3
};//for loading screen
window.addEventListener('load',function(){
  var loadingScreen=document.getElementById('loadingScreen');
  document.body.removeChild(loadingScreen);
});
//for fps display
(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()




//Ammojs Initialization
Ammo().then(start);

function start() {
  tmpTrans = new Ammo.btTransform();
  collectCounter = 0;
  this.gamestate=GAMESTATE.RUNNING;

 
  
  setupPhysicsWorld();
  setupGraphics();
  
  for(var i=0;i<70;i++){
    createCollectible1();
  } 
  // for(var i=0;i<15;i++){
  //   createCollectible1();
  // } 
  createCollectible1();
  createCollectible2();

  
  createBlock();
  createBall();
  loadNPC();
  for (var i = 0; i < 20; i++) {
    createTree();
  }
  for (var i = 0; i < 5; i++) {
    createRock();
  }
  for (var i = 0; i < 30; i++) {
    createGrass();
  }
  for (var i = 0; i < 60; i++) {
    createFlower_1();
  }
  for (var i = 0; i < 60; i++) {
    createFlower_2();
  }
  for (var i = 0; i < 20; i++) {
    createMushroom();
  }

  for (var i = 0; i < 50; i++) {
    createTree_2();
  }
  for (var i = 0; i < 50; i++) {
    createTree_3();
  }
  for (var i = 0; i < 8; i++) {
    createBush();
  }


  loadVolcano();
  //createHead();
  for (var i = 0; i < 50; i++) {
    createTree();
  }  
  

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
  const PointsEl=document.querySelector('#PointsEl');
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

  //Setup the renderer
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setClearColor(0x000, 0);
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
  let deltaTime = clock.getDelta();
  //createFont();
  
    moveBall();
  
  //moveHero();
  camera.lookAt(ballObject.position);
  updatePhysics(deltaTime);
  if(this.gamestate===GAMESTATE.PAUSED){
    document.getElementById("Game Paused").style.visibility="visible";
  }
  else{
    document.getElementById("Game Paused").style.visibility="hidden";
  }
  renderer.render(scene, camera);

  requestAnimationFrame(renderFrame);

  if ((Math.abs(ballObject.position.getComponent(0) - collectible1Object.position.getComponent(0)) <= 2) && (Math.abs(ballObject.position.getComponent(2) - collectible1Object.position.getComponent(2)) <=2) ){ //change
    scene.remove(collectible1Object); //PROBLEM: shape is still there, just hidden. probably not deleting collision shape that is wrapped around shape. 
    physicsWorld.removeRigidBody( collectible1Object.userData.physicsBody );
    collectCounter++;
    console.log(collectCounter); //kinda works

  //   //createFont();

  //   //may need to remove the object from rigidbodies array.
  }

  if ((Math.abs(ballObject.position.getComponent(0) - collectible2Object.position.getComponent(0)) <= 2) && (Math.abs(ballObject.position.getComponent(2) - collectible2Object.position.getComponent(2)) <=2) ){ 
      scene.remove(collectible2Object); //PROBLEM: shape is still there, just hidden. probably not deleting collision shape that is wrapped around shape. 
      physicsWorld.removeRigidBody( collectible2Object.userData.physicsBody );
      //make sound
      //add to counter to collect however many collectibles there are
      collectCounter++;
      //createFont();
      console.log(collectCounter);
  }
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
      if(firstPerson == false){
        firstPerson = true;
      }else{
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
      checkContact();//shows what the ball collides with
      break;

    case 80:
      TogglePause(); 
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

function setupContactResultCallback(){//this is for collision detection

  cbContactResult = new Ammo.ConcreteContactResultCallback();


  // Our implementation of addSingleResult() is straight forward and understandable:
  // Get distance from the contact point and exit if the distance is greater than zero.
  // Obtain the participating physics objects.
  // From them get their respective three.js objects.
  // Bearing in mind we are just after the tiles, we check for the three.js object that is not the ball and assign variables appropriately.
  // Finally, with some formatting, we log the information to the console.
  cbContactResult.addSingleResult = function(cp, colObj0Wrap, partId0, index0, colObj1Wrap, partId1, index1){

      let contactPoint = Ammo.wrapPointer( cp, Ammo.btManifoldPoint );

      const distance = contactPoint.getDistance();

      if( distance > 0 ) return;

      let colWrapper0 = Ammo.wrapPointer( colObj0Wrap, Ammo.btCollisionObjectWrapper );
      let rb0 = Ammo.castObject( colWrapper0.getCollisionObject(), Ammo.btRigidBody );

      let colWrapper1 = Ammo.wrapPointer( colObj1Wrap, Ammo.btCollisionObjectWrapper );
      let rb1 = Ammo.castObject( colWrapper1.getCollisionObject(), Ammo.btRigidBody );

      let threeObject0 = rb0.threeObject;
      let threeObject1 = rb1.threeObject;

      let tag, localPos, worldPos

      if( threeObject0.userData.tag != "ball" ){

          tag = threeObject0.userData.tag;
          localPos = contactPoint.get_m_localPointA();
          worldPos = contactPoint.get_m_positionWorldOnA();

      }
      else{

          tag = threeObject1.userData.tag;
          localPos = contactPoint.get_m_localPointB();
          worldPos = contactPoint.get_m_positionWorldOnB();

      }

      let localPosDisplay = {x: localPos.x(), y: localPos.y(), z: localPos.z()};
      let worldPosDisplay = {x: worldPos.x(), y: worldPos.y(), z: worldPos.z()};

      console.log( { tag, localPosDisplay, worldPosDisplay } );

  }

}

function checkContact(){//check if ball is in contact with collectible
  physicsWorld.contactTest( ball.userData.physicsBody , cbContactResult );
}
function jump(){
  if(this.gamestate===GAMESTATE.PAUSED){
    return;
  }
  cbContactPairResult.hasContact = false;

  physicsWorld.contactPairTest(ball.userData.physicsBody, blockPlane.userData.physicsBody, cbContactPairResult);

  if( !cbContactPairResult.hasContact ) return;

  let jumpImpulse = new Ammo.btVector3( 0, 15, 0 );

  let physicsBody = ball.userData.physicsBody;
  physicsBody.setLinearVelocity( jumpImpulse );
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


  document.getElementById("Menu_Buttons").style.visibility="visible";

}
function Resume(){
  //window.location.href="index.html";
  document.getElementById("Menu_Buttons").style.visibility="hidden";

}
function Controls(){
  document.getElementById("Menu_Buttons").style.visibility="hidden";
  //set controls div to visible

}
function Quit(){
 location.reload();

}

function setupContactPairResultCallback(){ //this is for the ball and the block

  cbContactPairResult = new Ammo.ConcreteContactResultCallback();

  cbContactPairResult.hasContact = false;

  cbContactPairResult.addSingleResult = function(cp, colObj0Wrap, partId0, index0, colObj1Wrap, partId1, index1){

      let contactPoint = Ammo.wrapPointer( cp, Ammo.btManifoldPoint );

      const distance = contactPoint.getDistance();

      if( distance > 0 ) return;

      this.hasContact = true;

  }

}

function updatePhysics(deltaTime) { // update physics world
  // Step world
  physicsWorld.stepSimulation(deltaTime, 10);
  if(this.gamestate===GAMESTATE.PAUSED || this.gamestate===GAMESTATE.MENU){
    return;
  }
  
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

      // First Person
      if(firstPerson == true){

        // Perspective from objects eyes
        camera.position.set(p.x(), p.y(), p.z());

        // Look 100 units ahead
        camera.lookAt(p.x(), p.y(), p.z() - 100);
        
        // Temporarily change camera view (still in first person)
        if(lookLeft == true){
          camera.lookAt(p.x() - 100, p.y() , p.z());
          }else
          if(lookRight == true){
            camera.lookAt(p.x() + 100, p.y(), p.z());
          }else
          if(lookBack == true){
            camera.lookAt(p.x(), p.y(), p.z() +  100);
          }

        }

        // Third Person
        else {

        // Perspective from behind object and slightly above
        camera.position.set(p.x(),p.y() + 8,p.z() + 15);

        // Look slightly above object
        camera.lookAt(p.x(), p.y() + 5, p.z());

        // Temporarily change camera view (still in first person)
        if(lookLeft == true){
        camera.position.set(p.x() + 10,p.y() + 5,p.z());
        camera.lookAt(p.x() - 100, p.y() , p.z());
        }
        else
        if(lookRight == true){
          camera.position.set(p.x() - 10,p.y() + 5,p.z());
          camera.lookAt(p.x() + 100, p.y(), p.z());
        }
        else
        if(lookBack == true){
          camera.position.set(p.x(),p.y() + 5,p.z() - 10);
          camera.lookAt(p.x(), p.y(), p.z() +  100);
        }
        
      }
      
    }
  }
}
