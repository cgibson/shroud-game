import {Actor, Player, Item} from "./actor";
import Vector2D = Phaser.Point;


export class Health extends Item {

    constructor(position: Vector2D, game: Phaser.Game, map: Phaser.Tilemap, amount = 25) {
        super(position, game, map, "health");
        this.amount = 25;
    }

    amount: number;

    onPickup(actor: Actor) {
        if (!(actor instanceof Player)) {
            console.log("Non-players shouldn't pick up health items!");
            return;
        }
        const player = <Player> actor;

        player.heal(this.amount);
        this.destroy();
    }
}


export class Battery extends Item {

    constructor(position: Vector2D, game: Phaser.Game, map: Phaser.Tilemap, amount = 25) {
        super(position, game, map, "battery");
        this.amount = 25;
    }

    amount: number;

    onPickup(actor: Actor) {
        if (!(actor instanceof Player)) {
            console.log("Non-players shouldn't pick up fuel items!");
            return;
        }
        const player = <Player> actor;

        player.lantern.addFuel(this.amount);
        this.destroy();
    }
}