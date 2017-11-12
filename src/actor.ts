// import {Types} from "./types";

// import {LightProperties} from "./light";
// export module Actor {
//     export class Actor {
//
//         constructor(tile_coord: Types.Vector2D, game: Phaser.Game, asset_name: string) {
//             // this.id = Actor.CURRENT_ID++;
//             this.tile_coord = tile_coord;
//             this.game = game;
//
//             this.sprite = this.game.add.sprite(tile_coord.x * 48, tile_coord.y * 48, asset_name);
//
//             // Add this actor to the list of actors in the scene
//             // Actor.ACTORS[this.id] = this;
//         }
//
//         id: number;
//         tile_coord: Types.Vector2D;
//         game: Phaser.Game;
//         sprite: Phaser.Sprite;
//
//         // Actor's health, if any
//         health: number;
//
//         // Whether or not the entity has the ability to cast light in the scene
//         // light: LightProperties;
//
//         update() {
//             // Do nothing by default
//         }
//
//         // castsLight() {
//         //     return this.light.casts_light;
//         // }
//
//         moveTo(tile_coord: Types.Vector2D) {
//             // TODO: Check to see if this tile is empty
//             this.tile_coord = tile_coord;
//         }
//
//         move(vector: Types.Vector2D) {
//             this.tile_coord.add(vector);
//         }
//
//         // kill() {
//         //     this.sprite.kill();
//         //     delete Actor.ACTORS[this.id];
//         // }
//
//         // STATIC VARIABLES AND METHODS
//         // -------------------------------------------------------------------------
//         // static CURRENT_ID: number = 0;
//         // static ACTORS: {[key: number]: Actor} = {};
//
//         // Static list of actors in the scene
//         // GetActors() {
//         //     return Actor.ACTORS;
//         // }
//     }
// }