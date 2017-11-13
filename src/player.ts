import {Actor, ActorType} from "./actor";
import {Lantern} from "./lantern";
import Vector2D = Phaser.Point;


////////////////////////////////////////////////////////////////////////////////
// Player
//
// Handles all things related to light/emissiveness
////////////////////////////////////////////////////////////////////////////////
export class Player extends Actor {

    player_footstep: Phaser.Sound;

    constructor(position: Vector2D) {
        super(position, 'hero_up', ActorType.PLAYER);

        this.lantern = new Lantern();
        this.player_footstep = this.game.add.audio("player_footstep_01");
    }

    lantern: Lantern;

    down() {
       super.down();
       this.player_footstep.play();
    }
    up() {
        super.up();
        this.player_footstep.play();
     }
     left() {
        super.left();
        this.player_footstep.play();
     }
     right() {
        super.right();
        this.player_footstep.play();
     }
}