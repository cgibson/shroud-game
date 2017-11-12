import Vector2D = Phaser.Point;

class Actor {
    constructor(tile_coord: Vector2D, game: Phaser.Game, asset_name: string) {
        // this.id = Actor.CURRENT_ID++;
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

    update() {
        // Do nothing by default
    }

    moveTo(tile_coord: Vector2D) {
        // TODO: Check to see if this tile is empty
        this.tile_coord = tile_coord;
    }

    move(x: number, y: number) {
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
    GetActors() {
        return Actor.ACTORS;
    }
}

class Player extends Actor {

    constructor(position: Vector2D, game: Phaser.Game) {
        super(position, game, 'player');
    }
}

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

    game: Phaser.Game;
    map: Phaser.Tilemap;
    groundLayer: Phaser.TilemapLayer;
    cursors: Phaser.CursorKeys;
    bm: Phaser.Sprite;

    player: Player;

    preload() {
        // Load the level. Down the line we'll want to replace this with a procedural step
        this.game.load.tilemap('test_level', 'assets/tiles/test_level.json', null, Phaser.Tilemap.TILED_JSON);

        // This is the simplest tileset. Just one default tile
        this.game.load.image('tile', 'assets/images/tileset.png');

        // Entities
        this.game.load.spritesheet('blue_monster', 'assets/sprites/blue_monster.png', 48, 48, 4);
        this.game.load.image('player', 'assets/images/test_entity.png');

    }

    create() {
        // Create a new tilemap based on the loaded level
        this.map = this.game.add.tilemap('test_level');

        // Add a tilemap image
        this.map.addTilesetImage('default', 'tile');

        // Create the ground layer
        this.groundLayer = this.map.createLayer('GroundLayer');
        this.groundLayer.resizeWorld();

        this.cursors = this.game.input.keyboard.createCursorKeys();
        
        this.bm = this.game.add.sprite(40, 40, 'blue_monster');

        this.bm.animations.add('walk');

        this.bm.animations.play('walk', 4, true);

        this.game.add.tween(this.bm).to({ y: this.game.height }, 10000, Phaser.Easing.Linear.None, true);

        this.player = new Player( new Vector2D(0,0), this.game);
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
        
        if (this.bm.y >= 300) {
            this.bm.scale.x += 0.01;
            this.bm.scale.y += 0.01;
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