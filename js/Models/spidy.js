import {
    spidy_standing,
    leftSteps,
    rightSteps,
    spidy_jumping,
    spidy_shooting,
    spidy_jump_shooting,
    spidy_left_step_shoot,
    spidy_right_step_shoot,
    spidy_change_step_shoot,
    spidy_health,
    Lspidy_standing,
    Lspidy_jumping,
    Lspidy_shooting,
    Lspidy_jump_shooting,
    Lspidy_left_step_shoot,
    Lspidy_right_step_shoot,
    Lspidy_change_step_shoot,
    webshoot,
} from '../static/images.js'; 
const audio = new Audio("../assets/audio/shooting-web.mp3");

export default class Spidy {
    constructor(context,health,bullets) {

        this.ctx = context;
        this.health = health;
        this.x = 0;
        this.y = 200;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isJumping = false;
        this.isShooting = false;
        this.webs = [];
        this.bullets = bullets;
        this.direction = 'right';
        this.images = {
            standing: {
                right: spidy_standing,
                left: Lspidy_standing,
            },
            leftSteps: leftSteps,
            rightSteps: rightSteps,
            jumping: {
                right: spidy_jumping,
                left: Lspidy_jumping,
            },
            shooting: {
                right: spidy_shooting,
                left: Lspidy_shooting,
            },
            jumpShooting: {
                right: spidy_jump_shooting,
                left: Lspidy_jump_shooting,
            },
            leftStepShooting: {
                right: spidy_left_step_shoot,
                left: Lspidy_left_step_shoot,
            },
            rightStepShooting: {
                right: spidy_right_step_shoot,
                left: Lspidy_right_step_shoot,
            },
            changeStepShooting: {
                right: spidy_change_step_shoot,
                left: Lspidy_change_step_shoot,
            }
        };

        this.draw = this.draw.bind(this); 

        this.bindEvents();
    }

    bindEvents() {
        window.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    this.moveLeft();
                    break;
                case 'ArrowRight':
                    this.moveRight();
                    break;
                case 'ArrowUp':
                    this.jump();
                    break;
                case ' ':
                    if(this.bullets > 0){
                    this.shoot();
                    
                }
            else
            {
                resetGame();
            }
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                case 'ArrowRight':
                    this.velocityX = 0;
                    break;
                case ' ':
                    this.shooting = false;
                    break;
            }
        });
    }

    web = {
        x: 0,
        y: 0,
        width: 15,
        height: 15,
        speed: 10,
    };

    moveLeft() {
        this.velocityX = -5;
        this.direction = 'left';
    }

    moveRight() {
        this.velocityX = 5;
        this.direction = 'right';
    }

    jump() {
        if (!this.isJumping) {
            this.isJumping = true;
            this.velocityY = -15;
        }
    }

    shoot() {
        if(!this.shooting){
            this.bullets--;
        this.shooting = true;
         const audio = new Audio("../assets/audio/shooting-web.mp3");
            audio.play();
        const newWeb = {
            x: this.x + (this.direction === 'right' ? 50 : -this.web.width),
            y: this.y + 20,
            direction: this.direction,
        };

        this.webs.push(newWeb);
    }
    }

    collides(rect1, rect2) {
        if(
            rect1.x > rect2.x && rect1.x<rect2.x+30 &&
            rect1.y > rect2.y && rect1.y < rect2.y + rect2.height
        ){
            return true;
        }
        else{ return false; }
    }
    
    update(base, onBuilding, enemies,buildings) {
        if (this.x + this.velocityX < 200 && this.x + this.velocityX > 0) {
            this.x += this.velocityX;
        }
        this.y += this.velocityY;
        if (this.y < base || !onBuilding) {
            this.velocityY += 1;
        } else {
            this.y = base;
            this.velocityY = 0;
            this.isJumping = false;
        }
        for (let i = this.webs.length - 1; i >= 0; i--) {
            const web = this.webs[i];
            web.x += (web.direction === 'right' ? 1 : -1) * this.web.speed;

            for (var enemy of enemies) {
                const enemyRect = {
                    x: enemy.x,
                    y: enemy.y,
                    width: enemy.width,
                    height: enemy.height,
                };
    
                if (this.collides(web, enemyRect)) {
                    console.log(enemy.health);
                    this.webs.splice(i, 1);
                    enemy.health--;
                    const buildingEnemy = buildings.find((building) => building.x+building.width/2 === enemy.x);
                    if (buildingEnemy) {
                        buildingEnemy.hasEnemy = false; 
                    }
                    
                   
                }
            }

            if (
                web.x > this.ctx.canvas.width ||
                web.x + this.web.width < 0
            ) {
                this.webs.splice(i, 1);
            }
        }
    
        this.draw();
    }


    draw() {
        let currentImage;

        if (this.shooting) {
            currentImage = this.images.shooting[this.direction];
        } else if (this.isJumping) {
            currentImage = this.images.jumping[this.direction];
        } else if (this.velocityX > 0) {
            currentImage = this.images.rightSteps[Math.floor(Date.now() / 200) % 3];
        } else if (this.velocityX < 0) {
            currentImage = this.images.leftSteps[Math.floor(Date.now() / 200) % 3];
        } else {
            currentImage = this.images.standing[this.direction];
        }

        for (const web of this.webs) {
            this.ctx.drawImage(webshoot, web.x, web.y, 20, 20);
        }


        const heartSize = 30;
        const heartPadding = 4;

        for (let i = 0; i < this.health; i++) {
            const heartX = (i+1) * (heartSize + heartPadding);
            const heartY = 40;

            this.ctx.drawImage(spidy_health, heartX, heartY, heartSize, heartSize);
        }

        this.ctx.drawImage(webshoot,500,40,50,50);
        this.ctx.font = "30px Comic Sans MS";
        this.ctx.fillStyle = "white";
        this.ctx.fillText(` - ${this.bullets}`, 550,74);

        this.ctx.drawImage(currentImage, this.x, this.y, 50, 50);
    }
}
