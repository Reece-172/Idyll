//this class creates the collectible objects 
class Collectible {
    constructor(){
    }
    
    //creates a collectible object
    createCollectible(){ 

        let scale = { x: 1, y: 1, z: 1 };
        let quat = { x: 0, y: 0, z: 0, w: 1 };
        let mass = 0;
        
        //threeJS Section
        this.collectible1Object = new THREE.Mesh(
            new THREE.BoxBufferGeometry(),
            new THREE.MeshPhongMaterial({ color: "gold" })
        );
        
        this.collectible1Object.position.set(Math.floor(Math.random() * (245 + 1)),2,-Math.floor(Math.random() * (245 + 1)));
        //collectible1.position.set(Math.floor(Math.random()*(100)),3,Math.floor(Math.random()*(100)));
        //collectible1.position.set(pos.x, pos.y, pos.z);
        this.collectible1Object.scale.set(scale.x, scale.y, scale.z);
        
        this.collectible1Object.castShadow = true;
        this.collectible1Object.receiveShadow = true;
        
        scene.add(this.collectible1Object);
        this.collectible1Object.userData.tag = "collectible1";
        
        //Ammojs Section
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(this.collectible1Object.position.x, this.collectible1Object.position.y, this.collectible1Object.position.z));
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
        
        physicsWorld.addRigidBody( body);
        
        this.collectible1Object.userData.physicsBody = body;
        rigidBodies.push(this.collectible1Object);
        body.threeObject = this.collectible1Object;
    }

    getCollectibleObject(){ //this will allow the main.js to access this.coolectible1object, while maintaining security of the collectible1Object variable
        return this.collectible1Object;
    }
}