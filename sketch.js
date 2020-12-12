//Create variables here
var canvas;
var dog, happyDog;
var database;
var dogImg, happyDogImg, sadDogImg;
var bedroomImg, gardenImg, washroomImg;
var feedDogBtn, addFoodBtn;
var fedTime, lastFed;
var foodObj;
var food, foodS;
var game, gameS;
var currentTime;

function preload() 
{
  //load images here
  dogImg = loadImage("images/dogImg.png");
  happyDogImg = loadImage("images/dogImg1.png");
  sadDogImg = loadImage("images/dogImg.png");
  bedroomImg = loadImage("images/Bed Room.png");
  washroomImg = loadImage("images/Wash Room.png");
  gardenImg = loadImage("images/Garden.png")
  bot=loadImage("images/milk1.png");
}

function setup()
 {
  canvas = createCanvas(700, 700);
  textAlign(CENTER, CENTER)
  textSize(15);
  fill("black");

  dog = createSprite(550, 250, 10, 10);
  dog.addImage("dog1", dogImg);
  dog.addImage("dog2", happyDogImg);
  dog.addImage("sad", sadDogImg);
  dog.scale = 0.2
  database = firebase.database();

  feedDogBtn = createButton("Feed Bella!");
  feedDogBtn.position(600, 100);
  feedDogBtn.mousePressed(feedDog);

  addFoodBtn = createButton("Add food!");
  addFoodBtn.position(400, 100);
  addFoodBtn.mousePressed(addFoodS);

  bowl = createSprite(502,300);
  bowl.addImage("bottle",bot);
  bowl.scale=0.030
  bowl.visible=false;
  
  foodObj = new Food();
  food = database.ref("Food");
  food.on("value", readStock);
  gameS = database.ref("gameState");
  gameS.on("value", readGameState);
  currentTime = hour();
}

function draw() 
{
  background(46, 139, 87);

  drawSprites();

  if (foodS === 0)
 {
    dog.changeAnimation("dog1", dogImg);
 }

  fedTime = database.ref("LastFed");
  fedTime.on("value", (data) => 
  {
    lastFed = data.val();
  })

  //display different backgrounds depending upon the time":
  if (currentTime == (lastFed + 1)) {
    updateGame("Playing");
    foodObj.garden();
  } else if (currentTime == (lastFed + 2)) {
    updateGame("Sleeping");
    foodObj.bedroom();
  } else if (currentTime > (lastFed + 2) && currentTime <= (lastFed + 4)) {
    updateGame("Bathing");
    foodObj.washroom();
  } else {
    updateGame("Hungry");
    foodObj.display();

    text("This is your female dog Bella!", 450, 30);
    text("No. of bottles left: " + foodS, 450, 90);
  }

  //Hide buttons if game state is not hungry!
  if (game !== "Hungry") {
    feedDogBtn.hide();
    addFoodBtn.hide();
    dog.remove();
    bowl.remove();
  } else {
    feedDogBtn.show();
    addFoodBtn.show();
    dog.changeAnimation("sad", sadDogImg);
  }
  //lines to display the time for last fed
  textSize(20)
  fill("Red")
  stroke("black")
  if (lastFed >= 12) {
    text("Last Fed Time: " + lastFed % 12 + " PM", 450, 60);
  } else if (lastFed === 0) {
    text("Last Fed Time: 12 AM", 450, 60);
  } else {
    text("Last Fed Time: " + lastFed + " AM", 450, 60);
  }
  //foodObj.display();

  //add styles here

}
function readStock(data) {
  foodS = data.val();
  foodObj.updateFoodStock(foodS);
  if (foodS < 0) {
    foodS = 0
    
  }
}
function feedDog() {
  dog.changeAnimation("dog2", happyDogImg);
  bowl.changeAnimation("bottle",bot);
  bowl.visible=true;

  foodObj.updateFoodStock(foodObj.getFoodStock() - 1);
  database.ref("/").update({
    Food: foodObj.getFoodStock(),
    LastFed: hour()
  })
}


function addFoodS() {
  foodS++
  database.ref("/").update({
    Food: foodS
  })
}

function readGameState(data) {
  game = data.val();
}

function updateGame(state) {
  database.ref("/").update({
    gameState: state
  });
}