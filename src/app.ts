import {AbstractGame} from "./interfaces"
import {Actor} from "./actor";
import {Player} from "./player";
import {Battery} from "./items";
import {UI} from "./ui";
import {Monster, Ghoul} from "./monsters";
import {LightCache} from "./light_cache";
import Vector2D = Phaser.Point;


////////////////////////////////////////////////////////////////////////////////
// SimpleGame
//
// Main game logic
////////////////////////////////////////////////////////////////////////////////
class SimpleGame extends AbstractGame {

    constructor() {
        super();
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
    private static map_singleton_: Phaser.Tilemap;

    groundLayer: Phaser.TilemapLayer;
    obstacleLayer: Phaser.TilemapLayer;
    ui: UI;
    monsters: Array<Monster>;

    // Keys
    left_key: Phaser.Key;
    right_key: Phaser.Key;
    up_key: Phaser.Key;
    down_key: Phaser.Key;

    player: Player;
    private static player_singleton_: Player;

    time_since_last_tick : number;

    music_01: Phaser.Sound;
    ambiance_01: Phaser.Sound;

    light_cache: LightCache;

    preload() {
        // Load the level. Down the line we'll want to replace this with a procedural step
        this.game.load.tilemap('test_level', 'assets/levels/first_room.json', null, Phaser.Tilemap.TILED_JSON);

        // This is a sample tileset
        this.game.load.image('tile', 'assets/images/tile_sheets/basic_tiles.png');
        this.game.load.image('light_tile', 'assets/images/black.png');

        // Entities
        this.game.load.spritesheet('ghoul', 'assets/sprites/ghoul.png', 48, 48, 16);
        this.game.load.spritesheet('hp', 'assets/sprites/health_bar.png', 48, 48, 5);
        this.game.load.image('hero_down', 'assets/images/hero_down.png');
        this.game.load.image('hero_left', 'assets/images/hero_left.png');
        this.game.load.image('hero_right', 'assets/images/hero_right.png');
        this.game.load.image('hero_up', 'assets/images/hero.png');
        this.game.load.image('battery', 'assets/images/battery.png');
        this.game.load.image('fuel', 'assets/images/fuel.png');
        this.game.load.image('lamp', 'assets/images/lamp.png');

        // Music
        this.game.load.audio('ambiance_01', 'assets/audio/ambiance_01.wav');
        this.game.load.audio('music_01', 'assets/audio/music_01.wav');

        // SFX
        this.game.load.audio('player_footstep_01', 'assets/audio/player_footstep_01.wav');
        this.game.load.audio('ghoul_loop', 'assets/audio/ghoul_loop.wav');
        this.game.load.audio('pickup', 'assets/audio/pickup.wav');

    }

    create() {
        // Create a new tilemap based on the loaded level
        this.map = this.game.add.tilemap('test_level');

        // Ugly hack to allow us to access the map from anywhere
        SimpleGame.map_singleton_ = this.map;

        // Add a tilemap image
        this.map.addTilesetImage('basic_tiles', 'tile');

        // Create the ground layer
        this.groundLayer = this.map.createLayer('GroundLayer');
        this.obstacleLayer = this.map.createLayer('Fence');
        this.groundLayer.resizeWorld();

        // Create a test monster
        this.monsters = new Array<Monster>();
        this.monsters.push(new Ghoul(new Phaser.Point(2, 3)));
        var ghoul_monster = this.monsters[0];

        // Create a battery
        var battery = new Battery(new Vector2D(4, 4));

        this.light_cache = new LightCache();

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
        this.left_key.onDown.add( () => {
            this.player.left();
            this.light_cache.updateLightCache();
        } );
        this.right_key.onDown.add( () => {
            this.player.right();
            this.light_cache.updateLightCache();
        } );
        this.up_key.onDown.add( () => {
            this.player.up();
            this.light_cache.updateLightCache();
        } );
        this.down_key.onDown.add( () => {
            this.player.down();
            this.light_cache.updateLightCache();
        } );

        this.player = new Player( new Vector2D(1,1));

        this.game.camera.follow(this.player.sprite);

        // Another horrible hack to make the player accessible via singleton
        SimpleGame.player_singleton_ = this.player;

        this.ui = new UI(new Vector2D(300,20), this.game);
        this.time_since_last_tick = this.game.time.now;

        // Music!
        this.music_01 = this.game.add.audio('music_01');
        this.ambiance_01 = this.game.add.audio('ambiance_01');
        this.game.sound.setDecodedCallback([this.music_01, this.ambiance_01], () => {
            this.music_01.play();
            this.ambiance_01.loopFull();
        }, this);
        
    }

    update() {
        if (this.game.time.now - this.time_since_last_tick > 1000){
            Actor.GlobalTick();
            this.light_cache.updateLightCache();
            this.time_since_last_tick = this.game.time.now;
        }
        
        this.monsters[0].update();

    }

    render() {
        // Render debug camera information to the screen
        this.game.debug.cameraInfo(this.game.camera, 32, 500);
    }

    getMap() {
        return SimpleGame.map_singleton_;
    }

    getPlayer() {
        return SimpleGame.player_singleton_;
    }

    getGame() {
        return this.game;
    }
}

export function startGame() {
    AbstractGame.Create(SimpleGame);
}
