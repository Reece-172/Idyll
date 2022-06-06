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
  
    physicsWorld.addRigidBody(body, colGroupBlock, colGroupBall|colGroupChar|colGroupCollectible);
  
    body.threeObject = blockPlane;
  
    blockPlane.userData.physicsBody = body;              
  }

  function createTree(x, y) {
    let pos = { x: x, y: y, z: 0 };
    let scale = { x: 2, y: 2, z: 2 };
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    let mass = 0;
  
    var loader = new THREE.GLTFLoader();
    loader.load(
      "./resources/models/Tree.glb",
      function (gltf) {
        gltf.scene.scale.set(14, 14, 14);
        gltf.scene.position.set(
          Math.floor(Math.random() * (300 + 100)),
          18,
          Math.floor(Math.random() * (300 + 100))
        );
        gltf.scene.traverse(function (node) {
          if (node.isMesh) {
            node.castShadow = true;
          }
        });
        const tree = gltf.scene;
  
        scene.add(tree);
        //Ammojs Section -> physics section
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        transform.setRotation(
          new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
        );
  
        let motionState = new Ammo.btDefaultMotionState(transform);
  
        let localInertia = new Ammo.btVector3(0, 0, 0);
        let verticesPos = tree.geometry.getAttribute("position"),
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
  
        let colShape = new Ammo.btconvexTriangleMeshShape(
          triangle_mesh,
          (tree.geometry.verticesNeedUpdate = true)
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
  
        physicsWorld.addRigidBody(body, colGroupBlock, colGroupBall);
  
        tree.userData.physicsBody = body;
        //rigidBodies.push(tree);
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );
  }
  function createRock() {
    let pos = { x: 0, y: 0, z: 0 };
    let scale = { x: 2, y: 2, z: 2 };
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    let mass = 0;
  
    var loader = new THREE.GLTFLoader();
    loader.load(
      "./resources/models/enchantedforest_rock_2.glb",
      function (gltf) {
        gltf.scene.scale.set(4, 4, 4);
        gltf.scene.position.set(
          Math.floor(Math.random() * (250 + 1)),
          Math.floor(Math.random() * (2 + 1)),
          Math.floor(Math.random() * (250 + 1))
        );
          gltf.scene.traverse(function (node) {
          if (node.isMesh) {
            node.castShadow = true;
          }
        });
        const rock = gltf.scene;
  
        scene.add(rock);
        //Ammojs Section -> physics section
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        transform.setRotation(
          new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
        );
  
        let motionState = new Ammo.btDefaultMotionState(transform);
  
        let localInertia = new Ammo.btVector3(0, 0, 0);
        let verticesPos = rock.geometry.getAttribute("position"),
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
          (rock.geometry.verticesNeedUpdate = true)
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
  
        tree.userData.physicsBody = body;
        rigidBodies.push(rock);
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );
  }
  
  function createFlower_1() {
    let pos = { x: 0, y: 0, z: 0 };
    let scale = { x: 2, y: 2, z: 2 };
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    let mass = 0;
  
    var loader = new THREE.GLTFLoader();
    loader.load(
      "./resources/models/enchantedforest_flower_3.glb",
      function (gltf) {
        gltf.scene.scale.set(5, 5, 5);
        gltf.scene.position.set(
          -Math.floor(Math.random() * (245 + 1)),
          Math.floor(Math.random() * (2 + 1)),
          Math.floor(Math.random() * (245 + 1))
        );
        gltf.scene.traverse(function (node) {
          if (node.isMesh) {
            node.castShadow = true;
          }
        });
        const flower = gltf.scene;
  
        scene.add(flower);
        //Ammojs Section -> physics section
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        transform.setRotation(
          new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
        );
  
        let motionState = new Ammo.btDefaultMotionState(transform);
  
        let localInertia = new Ammo.btVector3(0, 0, 0);
        let verticesPos = flower.geometry.getAttribute("position"),
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
          (flower.geometry.verticesNeedUpdate = true)
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
  
        flower.userData.physicsBody = body;
        rigidBodies.push(flower);
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );
  }
  
  function createTree_2() {
    let pos = { x: 0, y: 0, z: 0 };
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    let mass = 0;
  
    var loader = new THREE.GLTFLoader();
    loader.load(
      "./resources/models/island_palm_2.glb",
      function (gltf) {
        gltf.scene.scale.set(4, 4, 4);
        gltf.scene.position.set(
          -Math.floor(Math.random() * (245 + 1)),
          Math.floor(Math.random() * (2 + 1)),
          -Math.floor(Math.random() * (245 + 1))
        );
        gltf.scene.traverse(function (node) {
          if (node.isMesh) {
            node.castShadow = true;
          }
        });
        const tree = gltf.scene;
  
        scene.add(tree);
        //Ammojs Section -> physics section
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        transform.setRotation(
          new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
        );
  
        let motionState = new Ammo.btDefaultMotionState(transform);
  
        let localInertia = new Ammo.btVector3(0, 0, 0);
        let verticesPos = tree.geometry.getAttribute("position"),
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
          (tree.geometry.verticesNeedUpdate = true)
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
  
        tree.userData.physicsBody = body;
        rigidBodies.push(tree);
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );
  }
  function createTree_3() {
    let pos = { x: 0, y: 0, z: 0 };
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    let mass = 0;
  
    var loader = new THREE.GLTFLoader();
    loader.load(
      "./resources/models/enchantedforest_tree_4.glb",
      function (gltf) {
        gltf.scene.scale.set(4, 4, 4);
        gltf.scene.position.set(
          Math.floor(Math.random() * (300 + 200)),
          -1,
          -Math.floor(Math.random() * (300 + 200))
        );
        gltf.scene.traverse(function (node) {
          if (node.isMesh) {
            node.castShadow = true;
          }
        });
        const tree = gltf.scene;
  
        scene.add(tree);
        //Ammojs Section -> physics section
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        transform.setRotation(
          new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
        );
  
        let motionState = new Ammo.btDefaultMotionState(transform);
  
        let localInertia = new Ammo.btVector3(0, 0, 0);
        let verticesPos = tree.geometry.getAttribute("position"),
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
          (tree.geometry.verticesNeedUpdate = true)
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
  
        tree.userData.physicsBody = body;
        rigidBodies.push(tree);
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );
  }
  function createBush() {
    let pos = { x: 0, y: 0, z: 0 };
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    let mass = 0;
  
    var loader = new THREE.GLTFLoader();
    loader.load(
      "./resources/models/island_bush_1.glb",
      function (gltf) {
        gltf.scene.scale.set(4, 4, 4);
        gltf.scene.position.set(
          -Math.floor(Math.random() * (245 + 1)),
          Math.floor(Math.random() * (2 + 1)),
          -Math.floor(Math.random() * (245 + 1))
        );
        gltf.scene.traverse(function (node) {
          if (node.isMesh) {
            node.castShadow = true;
          }
        });
        const tree = gltf.scene;
  
        scene.add(tree);
        //Ammojs Section -> physics section
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        transform.setRotation(
          new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
        );
  
        let motionState = new Ammo.btDefaultMotionState(transform);
  
        let localInertia = new Ammo.btVector3(0, 0, 0);
        let verticesPos = tree.geometry.getAttribute("position"),
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
          (tree.geometry.verticesNeedUpdate = true)
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
  
        tree.userData.physicsBody = body;
        rigidBodies.push(tree);
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );
  }
  function createFlower_2() {
    let pos = { x: 0, y: 0, z: 0 };
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    let mass = 0;
  
    var loader = new THREE.GLTFLoader();
    loader.load(
      "./resources/models/enchantedforest_flower_5.glb",
      function (gltf) {
        gltf.scene.scale.set(5, 5, 5);
        gltf.scene.position.set(
          -Math.floor(Math.random() * (245 + 1)),
          Math.floor(Math.random() * (2 + 1)),
          Math.floor(Math.random() * (245 + 1))
        );
        gltf.scene.traverse(function (node) {
          if (node.isMesh) {
            node.castShadow = true;
          }
        });
        const flower = gltf.scene;
  
        scene.add(flower);
        //Ammojs Section -> physics section
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        transform.setRotation(
          new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
        );
  
        let motionState = new Ammo.btDefaultMotionState(transform);
  
        let localInertia = new Ammo.btVector3(0, 0, 0);
        let verticesPos = flower.geometry.getAttribute("position"),
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
          (flower.geometry.verticesNeedUpdate = true)
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
  
        flower.userData.physicsBody = body;
        rigidBodies.push(flower);
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );
  }
  function createMushroom() {
    let pos = { x: 0, y: 0, z: 0 };
    let quat = { x: 0, y: 0, z: 0, w: 1 };
    let mass = 0;
  
    var loader = new THREE.GLTFLoader();
    loader.load(
      "./resources/models/enchantedforest_mushroom_3.glb",
      function (gltf) {
        gltf.scene.scale.set(3, 3, 3);
        gltf.scene.position.set(
          -Math.floor(Math.random() * (245 + 1)),
          Math.floor(Math.random() * (2 + 1)),
          -Math.floor(Math.random() * (245 + 1))
        );
        gltf.scene.traverse(function (node) {
          if (node.isMesh) {
            node.castShadow = true;
          }
        });
        const mushroom = gltf.scene;
  
        scene.add(mushroom);
        //Ammojs Section -> physics section
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        transform.setRotation(
          new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
        );
  
        let motionState = new Ammo.btDefaultMotionState(transform);
  
        let localInertia = new Ammo.btVector3(0, 0, 0);
        let verticesPos = mushroom.geometry.getAttribute("position"),
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
          (mushroom.geometry.verticesNeedUpdate = true)
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
  
        mushroom.userData.physicsBody = body;
        rigidBodies.push(mushroom);
      },
      undefined,
      function (error) {
        console.error(error);
      }
    );
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
          Math.floor(Math.random() * (2 + 1)),
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
    if(this.gamestate===GAMESTATE.PAUSED){
      return;
    }
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