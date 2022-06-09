function createWorld() {
  Tree = new StaticModel("./resources/models/Tree.glb");

  for (var i = 0; i < 100; i++) {
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
      posY: 1,
      scaleX: 3,
      scaleY: 4,
      scaleZ: 3,
      colShapeScaleX: 0,
      colShapeScaleY: 0,
      colShapeScaleZ: 0,
    });
  }
  // Bush = new StaticModel("./resources/models/island_bush_1.glb");
  // for (var i = 0; i < 30; i++) {
  //   Bush.createModel({ posY: 0 });
  // }
//add clouds to the scene
  Cloud = new StaticModel("./resources/models/Clouds.glb");
  for (var i = 0; i < 50; i++) {
    Cloud.createModel({
      posX: Math.ceil(Math.random()*1000) * (Math.round(Math.random()) ? 1: -1),
      posY: 200,
      posZ: Math.ceil(Math.random()*1000) * (Math.round(Math.random()) ? 1: -1),
      scaleX: 200,
      scaleY: 200,
      scaleZ: 200,
      colShapeScaleX: 0,
      colShapeScaleY: 0,
      colShapeScaleZ: 0,
    });
  }
}
//creates an ocean 
function createOcean(){
  let pos = { x: 0, y: 0, z: 0 };
  let scale = { x: 3000, y: 1, z: 3000};

  // threeJS Section
  const texture = new THREE.TextureLoader().load("./resources/ocean.png");
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  ocean = new THREE.Mesh(
    new THREE.BoxBufferGeometry(),
    new THREE.MeshLambertMaterial({ map: texture })
  );

  ocean.position.set(pos.x, pos.y, pos.z);
  ocean.scale.set(scale.x, scale.y, scale.z);

  ocean.castShadow = true;
  ocean.receiveShadow = true;

  scene.add(ocean);

}

//loads a model from a glb file -> volcano
function loadVolcano() {
  var loader = new THREE.GLTFLoader();
  loader.load(
    "./resources/models/Volcano.glb",
    function (gltf) {
      gltf.scene.scale.set(400, 400, 400);
      gltf.scene.translateX(500);
      gltf.scene.translateZ(-800);
      gltf.scene.translateY(120);
      scene.add(gltf.scene);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
//point light for the volcano
const light = new THREE.PointLight( 0xff0000, 150, 300);
light.position.set( 200, 400, -500);
scene.add( light );
}