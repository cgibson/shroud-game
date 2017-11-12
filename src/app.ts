import Vector2D = Phaser.Point;


////////////////////////////////////////////////////////////////////////////////
// LightProperties
//
// Handles all things related to light/emissiveness
////////////////////////////////////////////////////////////////////////////////
class LightProperties {

    constructor() {

    }

    // True if this describes a lit/emissive object
    casts_light : boolean;
}


////////////////////////////////////////////////////////////////////////////////
// Actor
//
// Base class for all entities in the game
////////////////////////////////////////////////////////////////////////////////
class Actor {
    constructor(tile_coord: Vector2D, game: Phaser.Game, asset_name: string) {
        this.id = Actor.CURRENT_ID++;
        this.tile_coord = tile_coord;
        this.game = game;

        this.sprite = this.game.add.sprite(tile_coord.x * 48, tile_coord.y * 48, asset_name);

        // Add this actor to the list of actors in the scene
        Actor.ACTORS[this.id] = this;
    }

    id: number;
    tile_coord: Vector2D;
    game: Phaser.Game;
    sprite: Phaser.Sprite;

    // Actor's health, if any
    health: number;

    tick() {
        // Do nothing by default
    }

    moveTo(x: number, y: number) {
        // TODO: Check to see if this tile is empty
        this.tile_coord.x = x;
        this.tile_coord.y = y;
        this.sprite.position.x = x * 48;
        this.sprite.position.y = y * 48;
    }

    move(x: number, y: number) {
        this.tile_coord.add(x, y);
        this.sprite.position.x = this.tile_coord.x * 48;
        this.sprite.position.y = this.tile_coord.y * 48;
    }
    
    down() {}
    right() {}
    up() {}
    left() {}

    kill() {
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
}


////////////////////////////////////////////////////////////////////////////////
// Player
//
// Handles all things related to light/emissiveness
////////////////////////////////////////////////////////////////////////////////
class Player extends Actor {

    constructor(position: Vector2D, game: Phaser.Game) {
        super(position, game, 'player');
    }
}

enum DirectionEnum {
    DOWN,
    LEFT,
    UP,
    RIGHT
}

class Monster extends Actor {
    constructor(position: Vector2D, game: Phaser.Game, asset_name: string) {
        super(position, game, asset_name)
    }
    go(direction: DirectionEnum) {
        switch(direction) {
            case DirectionEnum.DOWN:
                this.down();
                break;
            case DirectionEnum.LEFT:
                this.left();
                break;
            case DirectionEnum.UP:
                this.up();
                break;
            case DirectionEnum.RIGHT:
                this.right();
                break;
            default:
                //AAAAAAHH!!
        }
    }
}

class Ghoul extends Monster {
    constructor(position: Vector2D, game: Phaser.Game) {
        super(position, game, 'ghoul');
        this.sprite.animations.add('down', [0,1,2,3], 4, true);
        this.sprite.animations.add('right', [4,5,6,7], 4, true);
        this.sprite.animations.add('up', [8,9,10,11], 4, true);
        this.sprite.animations.add('left', [12,13,14,15], 4, true);
    }
    
    previous_direction: DirectionEnum;
    direction_count = 0;
    scale = true;
    
    down() {
        this.sprite.animations.play('down');
        this.moveTo(this.tile_coord.x, this.tile_coord.y+1)
        this.previous_direction = DirectionEnum.DOWN;
    }
    right() {
        this.sprite.animations.play('right');
        this.moveTo(this.tile_coord.x+1, this.tile_coord.y)
        this.previous_direction = DirectionEnum.RIGHT;
    }
    up() {
        this.sprite.animations.play('up');
        this.moveTo(this.tile_coord.x, this.tile_coord.y-1)
        this.previous_direction = DirectionEnum.UP;
    }
    left() {
        this.sprite.animations.play('left');
        this.moveTo(this.tile_coord.x-1, this.tile_coord.y)
        this.previous_direction = DirectionEnum.LEFT;
    }
    
    tick() {
        if (this.direction_count < 3)
            this.go(this.previous_direction);
        else{
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
        if (this.scale) {
            this.sprite.scale.x += 0.01;
            this.sprite.scale.y += 0.01;
            if (this.sprite.scale.x >= 1.5)
                this.scale = false;
        }
        else {
            this.sprite.scale.x -= 0.01;
            this.sprite.scale.y -= 0.01;
            if (this.sprite.scale.x <= 1.0)
                this.scale = true;
        }
    }
}

////////////////////////////////////////////////////////////////////////////////
// SimpleGame
//
// Main game logic
////////////////////////////////////////////////////////////////////////////////
class SimpleGame {

    constructor() {
        // Construct the game object with a bunch of useful options
        this.game = new Phaser.Game(
            800,
            640,
            Phaser.AUTO,
            'content',
            {
                preload: this.preload,
                create: this.create,
                render: this.render,
                update: this.update,
            }
        );
    }

    baddies : Array<number>;
    game: Phaser.Game;
    map: Phaser.Tilemap;
    groundLayer: Phaser.TilemapLayer;
    cursors: Phaser.CursorKeys;
    monsters: Array<Monster>;

    player: Player;

    time_since_last_tick : number;

    preload() {
        // Load the level. Down the line we'll want to replace this with a procedural step
        this.game.load.tilemap('test_level', 'assets/levels/first_room.json', null, Phaser.Tilemap.TILED_JSON);

        // This is the simplest tileset. Just one default tile
        this.game.load.image('tile', 'assets/images/tile_sheets/basic_tiles.png');

        // Entities
        this.game.load.spritesheet('ghoul', 'assets/sprites/ghoul.png', 48, 48, 16);
        this.game.load.image('player', 'assets/images/test_entity.png');

    }

    create() {
        // Create a new tilemap based on the loaded level
        this.map = this.game.add.tilemap('test_level');

        // Add a tilemap image
        this.map.addTilesetImage('basic_tiles', 'tile');

        // Create the ground layer
        this.groundLayer = this.map.createLayer('GroundLayer');
        this.groundLayer = this.map.createLayer('Fence');
        this.groundLayer.resizeWorld();

        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.monsters = new Array<Monster>();
        this.monsters.push(new Ghoul(new Phaser.Point(2, 2), this.game));
        var ghoul_monster = this.monsters[0];
        //ghoul_monster.down();

        this.player = new Player( new Vector2D(0,0), this.game);

        this.time_since_last_tick = this.game.time.now;
    }

    update() {
        // Move the camera using the arrow keys
        if (this.cursors.up.isDown) {
            this.player.move(0, -0.1);
        } else if (this.cursors.down.isDown) {
            this.player.move(0, 0.1);
        }

        if (this.cursors.left.isDown) {
            this.player.move(-0.1, 0);
        } else if (this.cursors.right.isDown) {
            this.player.move(0.1, 0);
        }

        if (this.game.time.now - this.time_since_last_tick > 1000){
            Actor.GlobalTick();
            this.time_since_last_tick = this.game.time.now;
        }
    }

    render() {
        // Render debug camera information to the screen
        this.game.debug.cameraInfo(this.game.camera, 32, 500);
    }
}

function startGame() {
    var game = new SimpleGame();
}