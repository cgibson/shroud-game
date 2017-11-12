import Vector2D = Phaser.Point;
import {AbstractGame} from "./interfaces"


export enum ActorType {
    ITEM,
    MONSTER,
    PLAYER
};

////////////////////////////////////////////////////////////////////////////////
// Actor
//
// Base class for all entities in the game
////////////////////////////////////////////////////////////////////////////////
export class Actor {
    constructor(tile_coord: Vector2D, asset_name: string, type: ActorType, collidable: boolean = true, health: number = 100, speed: number = 1) {
        this.id = Actor.CURRENT_ID++;
        this.type = type;
        this.map = AbstractGame.GetInstance().getMap();
        this.tile_coord = tile_coord;
        this.game = AbstractGame.GetInstance().getGame();;
        this.health = health;
        this.max_health = health;
        this.speed = speed;
        this.collidable = collidable;

        this.sprite = this.game.add.sprite(tile_coord.x * 48, tile_coord.y * 48, asset_name);

        // Add this actor to the list of actors in the scene
        Actor.ACTORS[this.id] = this;
    }

    id: number;
    type: ActorType;
    map: Phaser.Tilemap
    tile_coord: Vector2D;
    game: Phaser.Game;
    sprite: Phaser.Sprite;

    collidable: boolean;

    // Actor's health, if any
    health: number;
    max_health: number;
    speed: number;

    tick() {
        // Do nothing by default
    }

    teleport(x: number, y: number) {
        // TODO: Check to see if this tile is empty
        this.tile_coord.x = x;
        this.tile_coord.y = y;
        this.sprite.position.x = x * 48;
        this.sprite.position.y = y * 48;
    }

    up(): boolean {
        this.sprite.key = 'hero_up';
        this.sprite.loadTexture(this.sprite.key, 0);
        return this.move(0, -this.speed);
    }

    down(): boolean {
        this.sprite.key = 'hero_down';
        this.sprite.loadTexture(this.sprite.key, 0);
        return this.move(0, this.speed);
    }

    left(): boolean {
        this.sprite.key = 'hero_left';
        this.sprite.loadTexture(this.sprite.key, 0);
        return this.move(-this.speed, 0);
    }

    right(): boolean {
        this.sprite.key = 'hero_right';
        this.sprite.loadTexture(this.sprite.key, 0);
        return this.move(this.speed, 0);
    }
    
    collision_check(x: number, y: number): boolean {
        if (this.map.getTile(this.tile_coord.x+x, this.tile_coord.y+y, 'Fence') != null) {
            return true;
        }
        return false;
    }
    collision_check_vector(vector: Vector2D): boolean {
        if (this.map.getTile(this.tile_coord.x+vector.x, this.tile_coord.y+vector.y, 'Fence') != null) {
            return true;
        }
        return false;
    }

    move(x: number, y: number): boolean {
        // Check to see if the tile is occluded
        // TODO: Fail if any spaces along this path is occluded
        if (this.collision_check(x, y))
            return false;

        // TODO: If we can't move all the way due to collisions, stop early.

        var actors = Actor.FindActorsAtPoint(this.tile_coord.x + x, this.tile_coord.y + y);

        // Iterate through all actors. If there are monsters, attack the first one and don't
        // move
        var our_type = typeof(this);
        for (let key in actors) {
            // If the actor is collidable, only interact with the first one and bail out
            const actor = actors[key];
            if (actor.collidable) {
                // If it's a monster and we're a human... ATTAAACK
                if (actor.type == ActorType.MONSTER) {
                    // Monsters don't kill monsters
                    if (this.type == ActorType.PLAYER) {
                        this.attack(actor);
                    }
                }
                return false;
            }
        }

        // Otherwise, iterate through all items and pick them up
        for (let key in actors) {
            // If the actor is collidable, only interact with the first one and bail out
            const actor = actors[key];
            if (actor.type == ActorType.ITEM) {
                this.pickUp(actor);
            }
        }

        // Finally, make the move. Nothing else has stopped us
        this.tile_coord.add(x, y);
        this.sprite.position.x = this.tile_coord.x * 48;
        this.sprite.position.y = this.tile_coord.y * 48;
        return true;
    }

    attack(actor: Actor) {

    }

    pickUp(actor: Actor) {
        if (actor.type == ActorType.ITEM) {
            actor.onPickup(this);
        } else {
            console.log("I don't think you want to pick that up...");
        }
    }

    hurt(amount: number) {
        this.health = Math.max(this.health - amount, 0.0);
        if (this.isDead()) {
            this.kill();
        }
    }

    heal(amount: number) {
        this.health = Math.min(this.health + amount, this.max_health);
    }

    isDead() {
        return this.health <= 0.0;
    }

    // "Kills" the item, whatever that means in-game.
    kill() {
        this.health = 0.0;
    }

    // Actually removes the item from the game
    destroy() {
        this.sprite.kill();
        delete Actor.ACTORS[this.id];
    }



    // STATIC VARIABLES AND METHODS
    // -------------------------------------------------------------------------
    static CURRENT_ID: number = 0;
    static ACTORS: {[key: number]: Actor} = {};

    // Static list of actors in the scene
    static GetActors() {
        return Actor.ACTORS;
    }

    static GlobalTick() {
        const actors = Actor.GetActors();
        for (let key in actors) {
            actors[key].tick();
        }
    }

    static FindActorsAtPoint(x: number, y: number) {
        var actors_at_point = new Array<Actor>();

        const actors = Actor.GetActors();
        for (let key in actors) {
            const actor = actors[key];
            if ((actor.tile_coord.x == x) && (actor.tile_coord.y == y)) {
                actors_at_point.push(actor);
            }
        }
        return actors_at_point;
    }

    // A couple of hanging events
    onPickup(actor: Actor) {}
}