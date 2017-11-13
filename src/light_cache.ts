////////////////////////////////////////////////////////////////////////////////
// LightProperties
//
// Handles all things related to light/emissiveness
////////////////////////////////////////////////////////////////////////////////
import {AbstractGame} from "./interfaces";
import {Actor, ActorType} from "./actor";
import {Player} from "./player";
import {LightProperties} from "./light_properties";
import Vector2D = Phaser.Point;


class LightTile {

    constructor(tile_coord: Vector2D) {
        const game = AbstractGame.GetInstance().getGame();
        this.tile_coord = tile_coord;
        this.sprite = game.add.sprite(tile_coord.x * 48, tile_coord.y * 48, "light_tile");
        this.light_amount = 0;
    }

    setTileCoord(x: number, y: number) {
        this.sprite.position.x = x * 48;
        this.sprite.position.y = y * 48;
        this.tile_coord = new Vector2D(x, y);
    }

    updateSprite() {
        this.sprite.alpha = 1.0 - Math.min(this.light_amount, 100.0) / 100.0;
    }

    sprite: Phaser.Sprite;
    tile_coord: Vector2D;
    light_amount: number; // 100 is max light
}


function tilesAlongALine(v1: Vector2D, v2: Vector2D): Array<Vector2D> {
    var vectors = new Array<Vector2D>();

    let dx = v2.x - v1.x;
    let dy = v2.y - v1.y;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (v1.x > v2.x) {
            const tmp = v2;
            v2 = v1;
            v1 = tmp;
        }
        for (var x = v1.x; x <= v2.x; ++x) {
            let y = v1.y + dy * (x - v1.x) / dx;
            vectors.push(new Vector2D(Math.round(x), Math.round(y)));
        }
    } else {
        if (v1.y > v2.y) {
            const tmp = v2;
            v2 = v1;
            v1 = tmp;
        }
        for (var y = v1.y; y <= v2.y; ++y) {
            let x = v1.x + dx * (y - v1.y) / dy;
            vectors.push(new Vector2D(Math.round(x), Math.round(y)));
        }
    }

    return vectors;
}

function testPointOccludor(v: Vector2D): boolean {
    const map = AbstractGame.GetInstance().getMap();
    const occludes = (v.x <= 0) || (v.y <= 0) || (map.getTile(v.x, v.y, 'Fence') != null);
    if (occludes) {
        return true;
    }

    const actors = Actor.FindActorsAtPoint(v.x, v.y);
    for (var idx = 0; idx < actors.length; ++idx) {
        const actor = actors[idx];
        if (actor.occludes) {
            return true;
        }
    }
    return false;
}

function testPathOccluded(v1: Vector2D, v2: Vector2D) : boolean {
    const vectors = tilesAlongALine(v1, v2);

    // Iterate through each vector along the line. Also ignore the first AND
    // last elements in this array because they are likely the source and
    // destination tiles.
    for (var idx = 1; idx < vectors.length - 1; ++idx) {
        const vector = vectors[idx];
        const occludes = testPointOccludor(vector);
        if (occludes) {
            return true;
        }
    }
    return false;
}


export class LightCache {

    constructor(width: number = 41, height: number = 41) {
        //this.map = AbstractGame.GetInstance().getMap();

        this.light_cache = new Array<LightTile>();

        this.width = width;
        this.height = height;

        // Build the initial light cache
        this.buildLightCache();
    }

    light_cache: Array<LightTile>;

    width: number;
    height: number;

    buildLightCache() {
        console.log("BUILDING lighting cache");
        for(var x = 0; x < this.width; ++x) {
            for(var y = 0; y < this.height; ++y) {
                this.light_cache.push(new LightTile(new Vector2D(x, y)));
            }
        }
    }

    accumulateLight(cache_coord: Vector2D, tile_coord: Vector2D): number {
        var accumulated = 0;
        for (var x = -1; x <= 1; ++x) {
            for (var y = -1; y <= 1; ++y) {
                if (x == 0 && y == 0) {
                    continue;
                }
                if (testPointOccludor(new Vector2D(tile_coord.x + x, tile_coord.y + y))) {
                    continue;
                }
                const cache_x = cache_coord.x + x;
                const cache_y = cache_coord.y + y;
                if (cache_x < 0 || cache_x >= this.width) {
                    continue;
                }
                if (cache_y < 0 || cache_y >= this.height) {
                    continue;
                }
                accumulated += this.light_cache[(cache_coord.x + x) + this.width * (cache_coord.y + y)].light_amount * 0.3;

            }
        }
        return accumulated;
    }

    updateLightCache() {
        console.log("Updating lighting cache");
        const emsissive = this.getEmissiveActors();
        const player = AbstractGame.GetInstance().getPlayer();;

        // For each tile in the tile cache, calculate the new tile
        // coordinate based on the player position and then
        // determine the lit status of the tile based on occlusions
        // and all nearby emissive items
        // TODO: Do this

        // TODO: Remove hack that just uses player's position
        const half_width = Math.floor(this.width / 2);
        const half_height = Math.floor(this.height / 2);
        for(var x = 0; x < this.width; ++x) {
            for(var y = 0; y < this.height; ++y) {
                const tile = this.light_cache[x + this.width * y];

                const new_x = player.tile_coord.x + x - half_width;
                const new_y = player.tile_coord.y + y - half_width;

                // Update the position of the tile
                tile.setTileCoord(new_x, new_y);

                // Update visibility of the tile (TODO: Replace with varying levels of dithering)
                if (!testPathOccluded(player.tile_coord, new Vector2D(new_x, new_y))) {
                    const distance = Math.sqrt(Math.pow(new_x - player.tile_coord.x, 2) +
                                               Math.pow(new_y - player.tile_coord.y, 2));
                    // TODO: Adjust based on player's fuel
                    const falloff_dist = player.lantern.fuel / 10.0;
                    const loss = 1.0 - Math.min(distance / falloff_dist, 1.0);
                    tile.light_amount += 100 * loss;
                }
            }
        }

        // "Accumulate" light from nearby tiles, but only for tiles
        // illuminated that aren't also occludors to avoid any bad bleed
        var accumulated_light = Array<number>(this.width * this.height);
        for(var x = 0; x < this.width; ++x) {
            for(var y = 0; y < this.height; ++y) {
                const tile = this.light_cache[x + this.width * y];
                accumulated_light[x + this.width * y] = this.accumulateLight(new Vector2D(x, y), tile.tile_coord);
            }
        }

        for(var x = 0; x < this.width; ++x) {
            for(var y = 0; y < this.height; ++y) {
                // Add accumulated light
                const tile = this.light_cache[x + this.width * y];
                tile.light_amount += accumulated_light[x + this.width * y];

                // Update sprite
                tile.updateSprite();

                // Reset lighting component for the next frame
                // TODO: Don't do this. It's sort of stupid
                tile.light_amount = 0;
            }
        }
    }

    getEmissiveActors() {
        var emissive = new Array<Actor>();

        const actors = Actor.GetActors();
        for (let key in actors) {
            const actor = actors[key];
            if (actor.getLightProperties()) {
                emissive.push(actor);
            }
        }

        return emissive;
    }
}