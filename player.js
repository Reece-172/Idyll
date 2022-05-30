function createBall() {
    let pos = { x: 0, y: 4, z: 0 };
    let radius = 2;
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    let mass = 1;
  
    //threeJS Section
    ball = (ballObject = new THREE.Mesh(
      new THREE.DodecahedronGeometry(radius),
      new THREE.MeshPhongMaterial({ color: 0xff0505 })
    ));
  
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
  
    physicsWorld.addRigidBody(body, colGroupBall, colGroupChar|colGroupBlock|colGroupTree|colGroupCollectible);
  
    ball.userData.physicsBody = body;
    rigidBodies.push(ball);
    body.threeObject = ball;
  }