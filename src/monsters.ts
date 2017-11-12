import {Monster, DirectionEnum} from "./actor";
import Vector2D = Phaser.Point;


////////////////////////////////////////////////////////////////////////////////
// Ghoul
////////////////////////////////////////////////////////////////////////////////
export class Ghoul extends Monster {
    constructor(position: Vector2D, game: Phaser.Game, map: Phaser.Tilemap) {
        super(position, game, map, 'ghoul');
        this.sprite.animations.add('down', [0,1,2,3], 4, true);
        this.sprite.animations.add('right', [4,5,6,7], 4, true);
        this.sprite.animations.add('up', [8,9,10,11], 4, true);
        this.sprite.animations.add('left', [12,13,14,15], 4, true);
    }

    previous_direction = DirectionEnum.DOWN;
    direction_count = 0;
    scale = true;

    down() {
        this.sprite.animations.play('down');
        this.teleport(this.tile_coord.x, this.tile_coord.y+1)
        this.previous_direction = DirectionEnum.DOWN;
        this.direction_count++;
    }
    right() {
        this.sprite.animations.play('right');
        this.teleport(this.tile_coord.x+1, this.tile_coord.y)
        this.previous_direction = DirectionEnum.RIGHT;
        this.direction_count++;
    }
    up() {
        this.sprite.animations.play('up');
        this.teleport(this.tile_coord.x, this.tile_coord.y-1)
        this.previous_direction = DirectionEnum.UP;
        this.direction_count++;
    }
    left() {
        this.sprite.animations.play('left');
        this.teleport(this.tile_coord.x-1, this.tile_coord.y)
        this.previous_direction = DirectionEnum.LEFT;
        this.direction_count++;
    }

    tick() {
        if (this.direction_count < 3)
            this.go(this.previous_direction);
        else{
            this.direction_count = -1;
            switch(this.previous_direction) {
                case DirectionEnum.DOWN:
                    this.right();
                    break;
               case DirectionEnum.RIGHT:
                    this.up();
                    break;
                case DirectionEnum.UP:
                    this.left();
                    break;
                case DirectionEnum.LEFT:
                    this.down();
                    break;
            }
            this.direction_count = 0;
        }
    }
    update() {
        if (this.scale) {
            this.sprite.scale.x += 0.005;
            this.sprite.scale.y += 0.005;
            if (this.sprite.scale.x >= 1.2)
                this.scale = false;
        }
        else {
            this.sprite.scale.x -= 0.005;
            this.sprite.scale.y -= 0.005;
            if (this.sprite.scale.x <= 0.95)
                this.scale = true;
        }
    }
}