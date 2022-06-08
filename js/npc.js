class NPC{
    constructor(path){
        this.path = path;
        this.npcObject = null;
    }

    
    createNPC({posX = -20, posY = 5, posZ = -20} = {}){

        let pos = { x: posX, y: posY, z: posZ };
        let quat = { x: 0, y: 0, z: 0, w: 1 };
        let mass = 0;

        var loader = new THREE.GLTFLoader();
        loader.load(
            this.path,
            function (gltf) {
            gltf.scene.scale.set(10, 10, 10);
            gltf.scene.traverse(function (node) {
                if (node.isMesh) {
                node.castShadow = true;
                }
            });

            this.npcObject = gltf.scene;
            this.npcObject.position.set(pos.x, pos.y, pos.z); //initial position of the model
            scene.add(this.npcObject);
            //this.npcObject.userData.tag = "NPCYasuo";
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
                new Ammo.btVector3(this.npcObject.scale.x * 0.3, this.npcObject.scale.y * 2, this.npcObject.scale.z * 0.5) //this is the size of the box around the model
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

            this.npcObject.userData.physicsBody = body;
            rigidBodies.push(this.npcObject);
            body.threeObject = this.npcObject; //using this to show the collisions with the ball (using in setupContactResultCallback)

            //NPCs.push(this.npcObject);

            },
            undefined,
            function (error) {
            console.error(error);
            }
        );
    }

    getNPCObject(){ //this will allow the main.js to access this.coolectible1object, while maintaining security of the collectible1Object variable
        return this.npcObject;
    }

}