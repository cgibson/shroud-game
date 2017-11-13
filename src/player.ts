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

    down(): boolean {
       if (!super.down()) {
           return false;
       }
       this.player_footstep.play();
       return true;
    }
    up() {
       if (!super.up()) {
           return false;
       }
        this.player_footstep.play();
        return true;
     }
     left() {
       if (!super.left()) {
           return false;
       }
        this.player_footstep.play();
        return true;
     }
     right() {
       if (!super.right()) {
           return false;
       }
        this.player_footstep.play();
        return true;
     }
}