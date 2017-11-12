import {Actor, ActorType} from "./actor";
import {Lantern} from "./lantern";
import Vector2D = Phaser.Point;


////////////////////////////////////////////////////////////////////////////////
// Player
//
// Handles all things related to light/emissiveness
////////////////////////////////////////////////////////////////////////////////
export class Player extends Actor {

    constructor(position: Vector2D, game: Phaser.Game, map: Phaser.Tilemap) {
        super(position, game, map, 'hero_up', ActorType.PLAYER);

        this.lantern = new Lantern();
    }

    lantern: Lantern;
}