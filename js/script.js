import Spidy from "./Models/spidy.js";
import { health, maxBullets, maxEnemyHealth } from "./config.js";
import { webCartridge } from "./static/images.js";
import Block from "./Models/block.js"
import { knife } from "./static/images.js";
import Enemy from "./enemies.js";



const canvas = document.getElementsByTagName("canvas")[0];
const context = canvas.getContext("2d");
canvas.width = 1100;
canvas.height = 700;

var enemyImage=new Image();
enemyImage.src="../assets/enemy/venom-original.png";

const spidy_standing = new Image();
spidy_standing.src = "../../assets/spidy/standing.png";



const backgroundImage = new Image();
backgroundImage.src = "../assets/background/background.png";


const buildingImage = new Image();
buildingImage.src = "../assets/background/building.png";

let backgroundX = 0;
let backgroundY = 0;

const minWidth = 200;
const maxWidth = 500;
const backgroundSpeed = 1;
const buildingSpeed = 6;
const buildingSpacing = 120;
const audio = new Audio("../assets/audio/60-theme-song.mp3");


function getRandomHeight() {
    return Math.random() * (50) + 150;
}


function getRandomWidth() {
    return Math.random() * (maxWidth - minWidth) + minWidth;
}

class Building {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.hasEnemy = Math.random() < 0.30;
        this.hasWebCartridge = Math.random() < 0.05;
        this.lastBulletTime = 0;
        this.cartridgePickedUp = false;
        
    }
}

const buildings = [];
var enemies = [];


function generateBuildings() {
    let x = 0;
    while (x < maxWidth) {
        const height = getRandomHeight();
        const width = getRandomWidth();
        const y = canvas.height - height;
        const building = new Building(x, y, width, height);
        buildings.push(building);
        x += (width + buildingSpacing);
    }

}

var bullets = [];
var cartridge = [];

generateBuildings(); 
const spidy = new Spidy(context,health,maxBullets);


function draw(context,currentTime) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.drawImage(backgroundImage, backgroundX, backgroundY, canvas.width, canvas.height);
    context.drawImage(backgroundImage, backgroundX + canvas.width, 0, canvas.width, canvas.height);


    if (backgroundX <= -canvas.width) {
        backgroundX = 0;
    }
    cartridge= [];
    enemies = [];
    for (const building of buildings) {

        context.drawImage(buildingImage, building.x, building.y, building.width, building.height);
        if (building.hasEnemy) {
            const enemy = new Enemy(enemyImage,building.x+building.width/2,building.y-60,60,60,maxEnemyHealth);
            if(enemy.health>0 ) {
          
                enemy.draw(context);
            enemies.push(enemy);

            if (currentTime - building.lastBulletTime >= 2000 && building.x < 800) {
                const bullet = new Block(knife, building.x+building.width/2,building.y-30,70,15);
                bullets.push(bullet);
                building.lastBulletTime = currentTime;
            }
        }
        }
        if (building.hasWebCartridge && !building.hasEnemy && !building.cartridgePickedUp) {
            const webs = new Block(webCartridge, building.x + building.width / 2, building.y - 150, 120, 60);
            cartridge.push(webs);
            webs.draw(context);
        }

    }




    const lastBuilding = buildings[buildings.length - 1];
    if (lastBuilding.x + lastBuilding.width <= canvas.width) {
        const width = getRandomWidth();
        const height = getRandomHeight();
        const x = lastBuilding.x + lastBuilding.width + buildingSpacing;
        const y = canvas.height - height;
        buildings.push(new Building(x, y, width, height));
    }
    
}



function isSpidyOnBuilding(buildings, spidy) {
    const spidyMidpoint = spidy.x + 25;

    for (const building of buildings) {
        if (
            spidyMidpoint > building.x &&
            spidyMidpoint < building.x + building.width &&
            spidy.y + 30 < building.y
        ) {
            return true;
        }
    }

    return false;
}

function moveBackground() {
    backgroundX -= backgroundSpeed;
    for (const building of buildings) {
        building.x -= buildingSpeed;
    }
}
function resetGame() {
    playing = false;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(backgroundImage, backgroundX, backgroundY, canvas.width, canvas.height);
    context.drawImage(backgroundImage, backgroundX + canvas.width, 0, canvas.width, canvas.height);
    context.font = "30px Comic Sans MS";
    bullets = [];
    spidy.x = -50;
    spidy.bullets = maxBullets;
    context.fillStyle = "white";
    context.fillText("Nice try", 450, 300);
    context.fillText("Press Enter To Play again", 370, 350);
    document.addEventListener("keydown",(e)=>{
        if(e.key == 'Enter' && !playing){
            buildings.length = 0    ;
            generateBuildings();
            
            spidy.y = buildings[0].y - 50;
            spidy.x = 50;
            i = 0;
        }
    })
    document.addEventListener("keyup",(e)=>{
        if(e.key == 'Enter'){
            playing = true;
            spidy.health = 10;
            spidy.velocityX = 0;
            spidy.velocityY = 0;
          
            game();
            
        }
    })
}

var spidyIsMoving = false;
var i = 0;

var playing = true;

function game(currentTime) {
    draw(context,currentTime);
    if (spidyIsMoving) {
        moveBackground();
    }

    if(buildings[0].x + buildings[0].width < 0){
        buildings.shift();
        i--;
    }
    if (buildings[i].x + buildings[i].width < 220) {
        i++;
    }
    if (cartridge.length > 0) {
        
        const firstCartridge = cartridge[0];
        
        if(firstCartridge.y < spidy.y + 30 && firstCartridge.y + 20 > spidy.y && spidy.x>firstCartridge.x && spidy.x<firstCartridge.x+30){
            spidy.bullets = maxBullets;  
           
            const buildingWithCartridge = buildings.find((building) => building.x + building.width / 2 === firstCartridge.x);
            if (buildingWithCartridge) {
                buildingWithCartridge.cartridgePickedUp = true; 
            }
            cartridge.shift();
            
           
            
                
                
        }
    }

    if (spidy.y > 1100) {
        resetGame();
    }
    bullets = bullets.filter((bullet) => {
        bullet.draw(context);

        if (spidyIsMoving) {
            bullet.x -= 10;
        } else {
            bullet.x -= 5;
        }
            if ( bullet.x > spidy.x && bullet.x < spidy.x + 30 && bullet.y > spidy.y && bullet.y < spidy.y+50) {
                spidy.health--;
                if(spidy.health == 0){
                    resetGame();
                }
            return false;
        }
    
        const bulletIsInCanvas = bullet.x > 0 && bullet.x < canvas.width;
        
        return bulletIsInCanvas;
    });
    spidy.update(buildings[i].y - 50, isSpidyOnBuilding(buildings, spidy),enemies,buildings);
    if (playing){
        requestAnimationFrame((timestamp) => game(timestamp));
    }
}

window.addEventListener('keydown', (event) => {
    if (event.key == 'ArrowRight' && spidy.x > 180) {
        spidyIsMoving = true;
    }
});
window.addEventListener('keyup', (event) => {
    if (event.key == 'ArrowRight') {
        spidyIsMoving = false;
        spidy.update();
    }
});


window.addEventListener('keydown', (event) => {
    audio.play();
    if (event.key === 'ArrowRight') {
        backgroundX -= backgroundSpeed;
        for (const building of buildings) {
            building.x -= buildingSpeed;
        }
    }
});



game();


