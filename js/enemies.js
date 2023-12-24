import Block from "./Models/block.js"

export default class Enemy extends Block{

    constructor(image,x,y,width,height,health){
        super(image,x,y,width,height);
        this.health = health;
       
    }

};