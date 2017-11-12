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

    preload() {
        // Load the level. Down the line we'll want to replace this with a procedural step
        this.game.load.tilemap('test_level', 'assets/tiles/test_level.json', null, Phaser.Tilemap.TILED_JSON);

        // This is the simplest tileset. Just one default tile
        this.game.load.image('tile', 'assets/images/tileset.png');
        
        this.game.load.spritesheet('blue_monster', 'assets/sprites/blue_monster.png', 48, 48, 4);
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
    }

    update() {
        // Move the camera using the arrow keys
        if (this.cursors.up.isDown) {
            this.game.camera.y -= 4;
        } else if (this.cursors.down.isDown) {
            this.game.camera.y += 4;
        }

        if (this.cursors.left.isDown) {
            this.game.camera.x -= 4;
        } else if (this.cursors.right.isDown) {
            this.game.camera.x += 4;
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

window.onload = () => {
    // Create a new game on-load
    var game = new SimpleGame();

};