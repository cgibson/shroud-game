import {Actor, ActorType} from "./actor";
import {Player} from "./player";
import Vector2D = Phaser.Point;


////////////////////////////////////////////////////////////////////////////////
// Items
//
// Entities that can be picked up by the player
////////////////////////////////////////////////////////////////////////////////
export class Item extends Actor {

    pickup: Phaser.Sound;

    constructor(position: Vector2D, asset_name: string) {
        super(position, asset_name, ActorType.ITEM);
        this.collidable = false;
        this.pickup = this.game.add.audio("pickup");
        this.occludes = false;
    }

    // Called when the item is picked up
    onPickup(actor: Actor) {
            
    }

    // May not be useful right now, but if we add the ability to "use" items,
    // have an onUse() event
    onUse(actor: Actor) {}
}


////////////////////////////////////////////////////////////////////////////////
// Health
////////////////////////////////////////////////////////////////////////////////
export class Health extends Item {

    constructor(position: Vector2D, amount = 25) {
        super(position, "health");
        this.amount = 25;
    }

    amount: number;

    onPickup(actor: Actor) {

        if (!(actor instanceof Player)) {
            console.log("Non-players shouldn't pick up health items!");
            return;
        }
        const player = <Player> actor;

        this.pickup.play();

        player.heal(this.amount);
        this.destroy();
    }
}


////////////////////////////////////////////////////////////////////////////////
// Battery
////////////////////////////////////////////////////////////////////////////////
export class Battery extends Item {

    constructor(position: Vector2D, amount = 25) {
        super(position, "battery");
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
        
        this.pickup.play();

        this.destroy();
    }
}