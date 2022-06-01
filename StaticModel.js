class StaticModel{
    constructor(path){
        this.path = path;
    }

    createModel({posX = Math.random() * (245 + 1), posY = Math.random() * (2 + 1), posZ = Math.random() * (245 + 1), scaleX = 4, scaleY = 4, scaleZ = 4, colShapeScaleX = 0.5, colShapeScaleY = 0.5, colShapeScaleZ = 0.5} = {}){ 
        //parameters of this function are in curly brackets to allow for selective parameters to be modified when calling. 
        //example of how to call this function -> Tree.createModel({scaleY: 10, posY:10, colShapeScaleY: 3}) . This specifies scaleY, posY, colShapeScaleY. Everything else will be default value

        let pos = { x: 0, y: 0, z: 0 };
        let quat = { x: 0, y: 0, z: 0, w: 1 };
        let mass = 0;

        var loader = new THREE.GLTFLoader();
        loader.load(
            this.path,
            function (gltf) {
            gltf.scene.scale.set(scaleX, scaleY, scaleZ);
            gltf.scene.position.set(
                -Math.floor(posX),
                Math.floor(posY),
                -Math.floor(posZ)
            );
            gltf.scene.traverse(function (node) {
                if (node.isMesh) {
                node.castShadow = true;
                }
            });
            const myObj = gltf.scene;

            scene.add(myObj);
            //Ammojs Section -> physics section
            let transform = new Ammo.btTransform();
            transform.setIdentity();
            transform.setOrigin(new Ammo.btVector3(myObj.position.x, myObj.position.y, myObj.position.z)); 
            transform.setRotation(
                new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w)
            );

            let motionState = new Ammo.btDefaultMotionState(transform);

            let localInertia = new Ammo.btVector3(0, 0, 0);

            const colShape = new Ammo.btBoxShape(
                new Ammo.btVector3(myObj.scale.x * colShapeScaleX, myObj.scale.y * colShapeScaleY, myObj.scale.z * colShapeScaleZ) //this is the size of the box around the model
            );
            colShape.setMargin(0.05);

            colShape.calculateLocalInertia(mass, localInertia);
            let rbInfo = new Ammo.btRigidBodyConstructionInfo(
                mass,
                motionState,
                colShape,
                localInertia
            );
            let body = new Ammo.btRigidBody(rbInfo);

            body.setFriction(4);
            body.setRollingFriction(10)
            body.setActivationState(STATE.DISABLE_DEACTIVATION);

            physicsWorld.addRigidBody(body, colGroupModel, colGroupBall);

            myObj.userData.physicsBody = body;
            rigidBodies.push(myObj);
            },
            undefined,
            function (error) {
            console.error(error);
            }
        );
    }


}