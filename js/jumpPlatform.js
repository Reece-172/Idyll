// Class for Floating Platforms to jump onto
class JumpPlatform {
    constructor(){
    }
    
    // Create Platform
    // Accepted Paramaters: x-y-z coordinates with the below values as defualts
    createPlatform({posX = -20, posY = 5, posZ = -20, object_texture = "image2.jpg"} = {}) {
        let pos = { x: posX, y: posY, z: posZ };
        let scale = { x: 10, y: 1, z: 10 };
        let quat = { x: 0, y: 0, z: 0, w: 1 };
        let mass = 0;
        let obj_texture = "./resources/" + object_texture;
      
        //threeJS Section
        const platform_texture = new THREE.TextureLoader().load(obj_texture);
        platform_texture.wrapS = THREE.RepeatWrapping;
        platform_texture.wrapT = THREE.RepeatWrapping;
        // platform_texture.repeat.set(8, 8);
        this.platformPlane = new THREE.Mesh(
          new THREE.BoxBufferGeometry(),
          new THREE.MeshLambertMaterial({ map: platform_texture})
        );
      
        this.platformPlane.position.set(pos.x, pos.y, pos.z);
        this.platformPlane.scale.set(scale.x, scale.y, scale.z);
      
        this.platformPlane.castShadow = true;
        this.platformPlane.receiveShadow = true;
      
        scene.add(this.platformPlane);
      
        this.platformPlane.userData.tag = "platformPlane";
      
        //Ammojs Section
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
        transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
        let motionState = new Ammo.btDefaultMotionState(transform);
      
        const colShape = new Ammo.btBoxShape(
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
      
        physicsWorld.addRigidBody(
          body,
          colGroupBlock,
          colGroupBall | colGroupNPC | colGroupCollectible
        );
      
        body.threeObject = this.platformPlane;
      
        this.platformPlane.userData.physicsBody = body;
      }

      getPlatformObject(){ //this will allow the main.js to access this.platformPlane, while maintaining security of the platformPlane variable
        return this.platformPlane;
    }

}