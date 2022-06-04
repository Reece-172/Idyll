function createWorld() {
  Tree = new StaticModel("./resources/models/Tree.glb");

  for (var i = 0; i < 200; i++) {
    Tree.createModel({
      posY: 24,
      scaleX: 20,
      scaleY: 20,
      scaleZ: 20,
      colShapeScaleY: 1,
      colShapeScaleX: 0.1,
      colShapeScaleZ: 0.1,
    });
  }

  Pond = new StaticModel("./resources/models/Pond.glb");
  Pond.createModel({
    posX: 100,
    posY: 2,
    posZ: 250,
    scaleX: 10,
    scaleY: 10,
    scaleZ: 10,
    //colShapeScaleY: 1,
  });
  // for (var i = 0; i < 5; i++) {
  //   createRock()
  // }
  Tent = new StaticModel("./resources/models/Tent.glb");
  Tent.createModel({
    posX: -100,
    posY: 1,
    posZ: -250,
    scaleX: 2,
    scaleY: 2,
    scaleZ: 2,
    colShapeScaleY: 0,
  });

  Grass = new StaticModel("./resources/models/enchantedforest_grass_2.glb");
  for (var i = 0; i < 200; i++) {
    Grass.createModel({
      posY:1,
      scaleX: 3,
      scaleY: 4,
      scaleZ: 3,
      colShapeScaleX: 0,
      colShapeScaleY: 0,
      colShapeScaleZ: 0,
    });
  }
  Bush = new StaticModel("./resources/models/island_bush_1.glb");
  for (var i = 0; i < 30; i++) {
    Bush.createModel(
      {posY: 0}
    );
  }
}
