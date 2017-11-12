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
        this.speed = 1; // Default actor speed

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

    up() {
        this.move(0, -this.speed);
    }

    down() {
        this.move(0, this.speed);
    }

    left() {
        this.move(-this.speed, 0);
    }

    right() {
        this.move(this.speed, 0);
    }

    move(x: number, y: number) {
        // TODO: Fail if any spaces along this path is occluded
        this.tile_coord.add(x, y);
        this.sprite.position.x = this.tile_coord.x * 48;
        this.sprite.position.y = this.tile_coord.y * 48;
    }

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

////////////////////////////////////////////////////////////////////////////////
// Alert
////////////////////////////////////////////////////////////////////////////////
class Alert {
    constructor(coords: Vector2D, game: Phaser.Game) {
	this.coords = coords;
	this.game = game;
    }

    coords: Vector2D;
    game: Phaser.Game;
}


////////////////////////////////////////////////////////////////////////////////
// ImageTextAlert
////////////////////////////////////////////////////////////////////////////////
class ImageTextAlert extends Alert {

}


////////////////////////////////////////////////////////////////////////////////
// TextAlert
////////////////////////////////////////////////////////////////////////////////
class TextAlert extends Alert {
    constructor(coords: Vector2D, game: Phaser.Game, text: string) {
	super(coords, game);
	this.text = text;
	this.text_obj = this.game.add.text(this.coords.x, this.coords.y, this.text, {font: "20px Arial", fill:"x111"});
    }

    text: string;
    text_obj: Phaser.Text;
}


////////////////////////////////////////////////////////////////////////////////
// UI
////////////////////////////////////////////////////////////////////////////////
class UI {
    constructor(coord: Vector2D, game: Phaser.Game) {
        this.coord = coord;
        this.game = game;
    }

    coord: Vector2D;
    game: Phaser.Game;
    alert: Alert;

    addTextAlert(text: string) {
	this.alert = new TextAlert(this.coord, this.game, text);
    }

    addImageAlert() {

    }
}



////////////////////////////////////////////////////////////////////////////////
// Monster
////////////////////////////////////////////////////////////////////////////////
class Monster extends Actor {
    constructor(position: Vector2D, game: Phaser.Game, asset_name: string) {
        super(position, game, asset_name)
    }
    update() {}
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


////////////////////////////////////////////////////////////////////////////////
// Ghoul
////////////////////////////////////////////////////////////////////////////////
class Ghoul extends Monster {
    constructor(position: Vector2D, game: Phaser.Game) {
        super(position, game, 'ghoul');
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
    ui: UI;
    monsters: Array<Monster>;

    // Keys
    left_key: Phaser.Key;
    right_key: Phaser.Key;
    up_key: Phaser.Key;
    down_key: Phaser.Key;

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
        this.game.load.image('hero_down', 'assets/images/hero_down.png');
        this.game.load.image('hero_left', 'assets/images/hero_left.png');
        this.game.load.image('hero_right', 'assets/images/hero_right.png');
        this.game.load.image('hero_up', 'assets/images/hero.png');
        this.game.load.image('battery', 'assets/images/battery.png');
        this.game.load.image('fuel', 'assets/images/fuel.png');
        this.game.load.image('lamp', 'assets/images/lamp.png');


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

        // Register keys
        this.left_key = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.right_key = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        this.up_key = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.down_key = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);

        this.game.input.keyboard.addKeyCapture(
            [
                Phaser.Keyboard.LEFT,
                Phaser.Keyboard.RIGHT,
                Phaser.Keyboard.UP,
                Phaser.Keyboard.DOWN
            ]
        );

        // Keybindings!
        this.left_key.onDown.add( () => this.player.left() );
        this.right_key.onDown.add( () => this.player.right() );
        this.up_key.onDown.add( () => this.player.up() );
        this.down_key.onDown.add( () => this.player.down() );

        this.player = new Player( new Vector2D(1,1), this.game);
        this.ui = new UI(new Vector2D(300,20), this.game);
        this.time_since_last_tick = this.game.time.now;
    }

    update() {
        if (this.game.time.now - this.time_since_last_tick > 1000){
            Actor.GlobalTick();
            this.time_since_last_tick = this.game.time.now;
        }
        
        this.monsters[0].update();

    }

    render() {
        // Render debug camera information to the screen
        this.game.debug.cameraInfo(this.game.camera, 32, 500);
    }
}

function startGame() {
    var game = new SimpleGame();
}
