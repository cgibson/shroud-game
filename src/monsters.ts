import {Actor, ActorType} from "./actor";
import Vector2D = Phaser.Point;


export enum DirectionEnum {
    DOWN,
    RIGHT,
    UP,
    LEFT,
};

////////////////////////////////////////////////////////////////////////////////
// Monster
////////////////////////////////////////////////////////////////////////////////
export class Monster extends Actor {
    constructor(position: Vector2D, asset_name: string) {
        super(position, asset_name, ActorType.MONSTER)
    }
    update() {}
    go(direction: DirectionEnum): boolean {
        switch(direction) {
            case DirectionEnum.DOWN:
                return this.down();
            case DirectionEnum.LEFT:
                return this.left();
            case DirectionEnum.UP:
                return this.up();
            case DirectionEnum.RIGHT:
                return this.right();
            default:
                //AAAAAAHH!!
        }
    }
}


////////////////////////////////////////////////////////////////////////////////
// Ghoul
////////////////////////////////////////////////////////////////////////////////
export class Ghoul extends Monster {
    constructor(position: Vector2D) {
        super(position,'ghoul');
        this.sprite.animations.add('down', [0,1,2,3], 4, true);
        this.sprite.animations.add('right', [4,5,6,7], 4, true);
        this.sprite.animations.add('up', [8,9,10,11], 4, true);
        this.sprite.animations.add('left', [12,13,14,15], 4, true);
    }

    previous_direction = DirectionEnum.DOWN;
    direction_count = 0;
    scale = true;

    down(): boolean {
        this.sprite.animations.play('down');
        this.previous_direction = DirectionEnum.DOWN;
        if (this.move(0, 1)) {
            this.direction_count++;
            return true;
        }
        return false;
    }
    right(): boolean {
        this.sprite.animations.play('right');
        this.previous_direction = DirectionEnum.RIGHT;
        if (this.move(1, 0)) {
            this.direction_count++;
            return true;
        }
        return false;
    }
    up(): boolean {
        this.sprite.animations.play('up');
        this.previous_direction = DirectionEnum.UP;
        if (this.move(0, -1)) {
            this.direction_count++;
            return true;
        }
        return false;
    }
    left(): boolean {
        this.sprite.animations.play('left');
        this.previous_direction = DirectionEnum.LEFT;
        if (this.move(-1, 0)) {
            this.direction_count++;
            return true;
        }
        return false;
    }
    
    step(): boolean {
        var direction = this.previous_direction;
        var collision_count = 0;
        while(this.collision_check_vector(this.direction_to_vector(direction)) == true) {
            direction = this.next(direction);
            if (direction == this.back(this.previous_direction) && collision_count < 3)
                direction = this.next(direction);
            collision_count++;
        }
        return this.go(direction);
    }
   
    go(direction: DirectionEnum): boolean {
        return super.go(direction);
    }

    next(direction: DirectionEnum): DirectionEnum {
        switch(direction) {
            case DirectionEnum.DOWN:
                return DirectionEnum.RIGHT;
            case DirectionEnum.RIGHT:
                return DirectionEnum.UP;
            case DirectionEnum.UP:
                 return DirectionEnum.LEFT;
            case DirectionEnum.LEFT:
                 return DirectionEnum.DOWN;
        }
    }
    
    back(direction: DirectionEnum): DirectionEnum {
        switch(direction) {
            case DirectionEnum.DOWN:
                return DirectionEnum.UP;
            case DirectionEnum.RIGHT:
                return DirectionEnum.LEFT;
            case DirectionEnum.UP:
                 return DirectionEnum.DOWN;
            case DirectionEnum.LEFT:
                 return DirectionEnum.RIGHT;
        }
    }
    
    direction_to_vector(direction: DirectionEnum): Vector2D {
        switch(direction) {
            case(DirectionEnum.DOWN):
                return new Vector2D(0, 1);
            case (DirectionEnum.RIGHT):
                return new Vector2D(1, 0);
            case (DirectionEnum.UP):
                return new Vector2D(0, -1);
            case (DirectionEnum.LEFT):
                return new Vector2D(-1, 0);
        }
    }
    
    tick() {
        this.step();
    }
    
    update() {
        if (this.scale) {
            this.sprite.scale.x += 0.002;
            this.sprite.scale.y += 0.002;
            if (this.sprite.scale.x >= 1.2)
                this.scale = false;
        }
        else {
            this.sprite.scale.x -= 0.002;
            this.sprite.scale.y -= 0.002;
            if (this.sprite.scale.x <= 0.95)
                this.scale = true;
        }
    }
}