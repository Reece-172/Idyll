function loadDoor() {
    let pos = { x: -200, y: 1, z: -200 };
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    let mass = 0;
  
    var loader = new THREE.GLTFLoader();
    loader.load(
        "./resources/models/Door.glb", 
      function (gltf) {
        gltf.scene.scale.set(10, 10, 10);
        gltf.scene.traverse(function (node) {
          if (node.isMesh) {
            node.castShadow = true;
          }
        });
        doorObject = gltf.scene;
        doorObject.position.set(pos.x, pos.y, pos.z); //initial position of the model
        scene.add(doorObject);
        doorObject.userData.tag = "doorObject";
        //Ammojs Section -> physics section
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        // transform.setRotation(
        //   new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
        // );
  
        let motionState = new Ammo.btDefaultMotionState(transform);
  
        let localInertia = new Ammo.btVector3(0, 0, 0);
  
        const colShape = new Ammo.btBoxShape(
          new Ammo.btVector3(doorObject.scale.x * 0.3, doorObject.scale.y * 2, doorObject.scale.z * 0.5) //this is the size of the box around the model
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
          colGroupNPC,
          colGroupBall | colGroupBlock
        );
  
        doorObject.userData.physicsBody = body;
        rigidBodies.push(doorObject);
        body.threeObject = doorObject; //using this to show the collisions with the ball (using in setupContactResultCallback)
  
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );
  }