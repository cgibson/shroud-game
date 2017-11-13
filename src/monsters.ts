import {Actor, ActorType} from "./actor";
import Vector2D = Phaser.Point;


export enum DirectionEnum {
    DOWN,
    RIGHT,
    UP,
    LEFT,
};

export enum DirectionClock {
    CLOCKWISE,
    COUNTERCLOCKWISE,
}

////////////////////////////////////////////////////////////////////////////////
// Monster
////////////////////////////////////////////////////////////////////////////////
export class Monster extends Actor {

    ghoul_loop: Phaser.Sound;

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
        this.ghoul_loop = this.game.add.audio("ghoul_loop");
        this.ghoul_loop.loopFull();
    }

    previous_direction = DirectionEnum.DOWN;
    direction_count = 0;
    step_count = 0;
    scale = true;
    turn = DirectionClock.COUNTERCLOCKWISE;

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
        if (direction == this.previous_direction && this.step_count > 3) {
            direction = this.next(direction);
            if (this.collision_check_vector(this.direction_to_vector(direction)) == true) {
                if (this.collision_check_vector(this.direction_to_vector(this.back(direction))) == true) {
                    direction = this.previous_direction;
                }
                else {
                    direction = this.back(direction)
                    this.step_count = 0;
                }
            }
            this.step_count = 0;
        }
        this.step_count++;
        if (Math.random() < 0.5) {
            this.turn = this.clockflip(this.turn);
        }
        return this.go(direction);
    }
   
    go(direction: DirectionEnum): boolean {
        return super.go(direction);
    }

    next(direction: DirectionEnum): DirectionEnum {
        if (this.turn == DirectionClock.COUNTERCLOCKWISE) {
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
        else if (this.turn == DirectionClock.CLOCKWISE) {
            switch(direction) {
                case DirectionEnum.DOWN:
                    return DirectionEnum.LEFT;
                case DirectionEnum.RIGHT:
                    return DirectionEnum.DOWN;
                case DirectionEnum.UP:
                     return DirectionEnum.RIGHT;
                case DirectionEnum.LEFT:
                     return DirectionEnum.UP;
            }
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
    
    clockflip(dir: DirectionClock) {
        if (dir == DirectionClock.CLOCKWISE)
            return DirectionClock.COUNTERCLOCKWISE
        return DirectionClock.CLOCKWISE
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