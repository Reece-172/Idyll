//collectible items (make a class in future)
function createCollectible1() {
    let pos = { x: -20, y: 6, z: 20 };
    let scale = { x: 1, y: 1, z: 1 };
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    let mass = 0;
  
    //threeJS Section
    let collectible1 = (collectible1Object = new THREE.Mesh(
      new THREE.BoxBufferGeometry(),
      new THREE.MeshPhongMaterial({ color: "blue" })
    ));
  
    collectible1.position.set(Math.floor(Math.random()*(400)),2,-Math.floor(Math.random()*(400)));
    collectible1.position.set(Math.floor(Math.random()*(100)),3,Math.floor(Math.random()*(100)));
    //collectible1.position.set(pos.x, pos.y, pos.z);
    collectible1.scale.set(scale.x, scale.y, scale.z);
  
    collectible1.castShadow = true;
    collectible1.receiveShadow = true;
  
    scene.add(collectible1);
  
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
  
    collectible1.userData.physicsBody = body;
  
    physicsWorld.addRigidBody( body, colGroupCollectible, colGroupBall);
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