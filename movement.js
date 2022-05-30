function moveHero() {
    //this goes in renderframe()
  
    let scalingFactor = 20;
  
    let moveX = HeroMoveDirection.right - HeroMoveDirection.left;
    let moveZ = HeroMoveDirection.back - HeroMoveDirection.forward;
    let moveY = 0; //0 because we not doing up-down movement
  
    if (moveX == 0 && moveY == 0 && moveZ == 0) return;
  
    let resultantImpulse = new Ammo.btVector3(moveX, moveY, moveZ);
    resultantImpulse.op_mul(scalingFactor);
  
    let physicsBody = heroObject.userData.physicsBody;
    physicsBody.setLinearVelocity(resultantImpulse);
  }