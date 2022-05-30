function loadNPC() {
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
        heroObject = new THREE.Mesh(yasuo.geomerty, yasuo.material);
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