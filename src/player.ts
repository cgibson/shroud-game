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
        
        this.health_bar = this.game.add.sprite(position.x * 48, position.y * 48, 'hp');
        
        this.health_bar.animations.add('full', [0], 1, true);
        this.health_bar.animations.add('one', [1], 1, true);
        this.health_bar.animations.add('two', [2], 1, true);
        this.health_bar.animations.add('three', [3], 1, true);
        this.health_bar.animations.add('dead', [4], 1, true);
        this.health_bar.animations.play('full');
    }

    lantern: Lantern;
    health_bar : Phaser.Sprite;
    expended_since_tick: boolean;

    move(x: number, y: number): boolean {
        var success = super.move(x, y);
        this.health_bar.position.x = this.tile_coord.x * 48;
        this.health_bar.position.y = this.tile_coord.y * 48;
        
        this.player_footstep = this.game.add.audio("player_footstep_01");
        this.expended_since_tick = false;
        
        return success;
    }

    tick() {
        if (this.expended_since_tick) {
            this.expended_since_tick = false;
            return;
        }
        this.lantern.expendFuel();
    }

    down(): boolean {
       if (!super.down()) {
           return false;
       }
       this.expended_since_tick = true;
       this.lantern.expendFuel();
       this.player_footstep.play();
       return true;
    }
    up() {
       if (!super.up()) {
           return false;
       }
       this.expended_since_tick = true;
       this.lantern.expendFuel();
       this.player_footstep.play();
       return true;
     }
     left() {
       if (!super.left()) {
           return false;
       }
        this.expended_since_tick = true;
        this.lantern.expendFuel();
        this.player_footstep.play();
        return true;
     }
     right() {
        if (!super.right()) {
           return false;
        }
        this.expended_since_tick = true;
        this.lantern.expendFuel();
        this.player_footstep.play();
        return true;
     }
}