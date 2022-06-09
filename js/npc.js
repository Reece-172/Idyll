function loadNPC1() {
    let pos = { x: 10, y: 1, z: -50 };
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    let mass = 0;
  
    var loader = new THREE.GLTFLoader();
    loader.load(
      "./resources/models/NPC 1.glb", 
      function (gltf) {
        gltf.scene.scale.set(10, 10, 10);
        gltf.scene.traverse(function (node) {
          if (node.isMesh) {
            node.castShadow = true;
          }
        });
        let npc1 = gltf.scene;
        npc1.position.set(pos.x, pos.y, pos.z); //initial position of the model
        scene.add(npc1);
        npc1.userData.tag = "NPC1";
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
          new Ammo.btVector3(npc1.scale.x * 0.3, npc1.scale.y * 2, npc1.scale.z * 0.5) //this is the size of the box around the model
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
  
        npc1.userData.physicsBody = body;
        rigidBodies.push(npc1);
        body.threeObject = npc1; //using this to show the collisions with the ball (using in setupContactResultCallback)
  
        NPCs.push(npc1);
  
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );
  }

function loadNPC2() {
let pos = { x: -10, y: 1, z: 50 };
let quat = { x: 0, y: 0, z: 0, w: 1 };
let mass = 0;

var loader = new THREE.GLTFLoader();
loader.load(
    "./resources/models/NPC 2.glb", 
    function (gltf) {
    gltf.scene.scale.set(10, 10, 10);
    gltf.scene.traverse(function (node) {
        if (node.isMesh) {
        node.castShadow = true;
        }
    });
    let npc2 = gltf.scene;
    npc2.position.set(pos.x, pos.y, pos.z); //initial position of the model
    scene.add(npc2);
    npc2.userData.tag = "NPC2";
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
        new Ammo.btVector3(npc2.scale.x * 0.3, npc2.scale.y * 2, npc2.scale.z * 0.5) //this is the size of the box around the model
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

    npc2.userData.physicsBody = body;
    rigidBodies.push(npc2);
    body.threeObject = npc2; //using this to show the collisions with the ball (using in setupContactResultCallback)

    NPCs.push(npc2);

    },
    undefined,
    function (error) {
    console.error(error);
    }
);
}

function loadNPC3() {
    let pos = { x: 50, y: 1, z: -10 };
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    let mass = 0;
  
    var loader = new THREE.GLTFLoader();
    loader.load(
        "./resources/models/NPC 3.glb", 
      function (gltf) {
        gltf.scene.scale.set(10, 10, 10);
        gltf.scene.traverse(function (node) {
          if (node.isMesh) {
            node.castShadow = true;
          }
        });
        let npc3 = gltf.scene;
        npc3.position.set(pos.x, pos.y, pos.z); //initial position of the model
        scene.add(npc3);
        npc3.userData.tag = "NPC3";
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
          new Ammo.btVector3(npc3.scale.x * 0.3, npc3.scale.y * 2, npc3.scale.z * 0.5) //this is the size of the box around the model
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
  
        npc3.userData.physicsBody = body;
        rigidBodies.push(npc3);
        body.threeObject = npc3; //using this to show the collisions with the ball (using in setupContactResultCallback)
  
        NPCs.push(npc3);
  
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );
  }