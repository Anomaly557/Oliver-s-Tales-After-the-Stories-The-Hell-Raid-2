var game;
var gameOptions = {

    // bird gravity, how fast the bird falls
    birdGravity: 1000,

    // horizontal bird speed (how fast the pipes scroll)
    birdSpeed: 250,

    // flap thrust (how powerful is a click)
    birdFlapPower: 400,

    // minimum pipe height, in pixels. Affects hole position
    minPipeHeight: 25,

    // distance range from next pipe, in pixels (how far apart are pipes min, max)
    pipeDistance: [200, 250],

    // hole range between pipes, in pixels (minimum hole height, maximum hole height)
    pipeHole: [175, 200],

    // local storage object name (this is for tracking scores)
    localStorageName: 'bestFlappyScore'
}

window.onload = function() {
    let gameConfig = {
        type: Phaser.AUTO,
        backgroundColor:0x87ceeb,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            parent: 'thegame',
            width: 800,
            height: 680
        },
        pixelArt: true,
	//were using the built in physics engine for gravity
        physics: {
            default: 'arcade',
            arcade: {
                gravity: {
                    y: 0
                }
            }
        },
        scene: playGame
    }
    game = new Phaser.Game(gameConfig);
    window.focus();
}

class playGame extends Phaser.Scene{
    constructor(){
        super('PlayGame');
    }

    //preload is where we get tell the game where our assets are e.g. images and sounds.
    preload(){

	    //github fix
	    this.load.setBaseURL('https://anomaly557.github.io/Oliver-s-Tales-After-the-Stories-The-Hell-Raid-2/');
	    
	    
        //loading a spritesheet animation
        this.load.spritesheet('bird', '../assets/img/clumsy.png', {
            frameWidth: 85,
            frameHeight: 60
        });
        
	//loading static images
        this.load.image('pipe', '../assets/img/pipe.png');
        this.load.image('background', '../assets/img/bg.png');
    }
    create(){
        
        //BACKGROUND
        this.add.image(0, 0, 'background').setOrigin(0, 0);
        
        //OBSTACLES
        this.pipeGroup = this.physics.add.group();
        //pipePool = pipes waiting to be placed.
        this.pipePool = [];
        //this is a loop to create
        for(let i = 0; i < 4; i++){
            this.pipePool.push(this.pipeGroup.create(0, 0, 'pipe'));
            this.pipePool.push(this.pipeGroup.create(0, 0, 'pipe'));
            this.placePipes(false);
        }
        this.pipeGroup.setVelocityX(-gameOptions.birdSpeed);
        
        //PLAYER
        this.bird = this.physics.add.sprite(80, game.config.height / 2, 'bird');
        this.bird.body.gravity.y = gameOptions.birdGravity;
        
	//this tells the game how to use the spritesheet
        var config = {
            key: 'flap',
            frames: this.anims.generateFrameNumbers('bird', { start: 0, end: 3}),
            frameRate: 10,
            repeat: -1
        };
        this.anims.create(config);
        this.bird.play('flap');
        
        //CONTROL LOGIC
        this.input.on('pointerdown', this.flap, this);

        //SCORING
        this.score = 0;
        this.topScore = localStorage.getItem(gameOptions.localStorageName) == null ? 0 : localStorage.getItem(gameOptions.localStorageName);
        this.scoreText = this.add.text(10, 10, '');
        this.updateScore(this.score);
    }

    updateScore(inc){
        this.score += inc;
        this.scoreText.text = 'Score: ' + this.score + '\nBest: ' + this.topScore;
    }

    placePipes(addScore){
        let rightmost = this.getRightmostPipe();
        let pipeHoleHeight = Phaser.Math.Between(gameOptions.pipeHole[0], gameOptions.pipeHole[1]);
        let pipeHolePosition = Phaser.Math.Between(gameOptions.minPipeHeight + pipeHoleHeight / 2, game.config.height - gameOptions.minPipeHeight - pipeHoleHeight / 2);
        this.pipePool[0].x = rightmost + this.pipePool[0].getBounds().width + Phaser.Math.Between(gameOptions.pipeDistance[0], gameOptions.pipeDistance[1]);
        this.pipePool[0].y = pipeHolePosition - pipeHoleHeight / 2;
        this.pipePool[0].setOrigin(0, 1);
        this.pipePool[1].x = this.pipePool[0].x;
        this.pipePool[1].flipY = true;
        this.pipePool[1].y = pipeHolePosition + pipeHoleHeight / 2;
        this.pipePool[1].setOrigin(0, 0);
        this.pipePool = [];

        if(addScore){
            this.updateScore(1);
        }
    }

    flap(){
        this.bird.body.velocity.y = -gameOptions.birdFlapPower;
//uncomment to reverse gravity onClick
//this.bird.body.gravity.y = this.bird.body.gravity.y *-1;
    }

    getRightmostPipe(){
        let rightmostPipe = 0;
        this.pipeGroup.getChildren().forEach(function(pipe){
            rightmostPipe = Math.max(rightmostPipe, pipe.x);
        });
        return rightmostPipe;
    }

    update(){

	//if bird hits a pipe
        this.physics.world.collide(this.bird, this.pipeGroup, function(){
            this.die();
        }, null, this);
	
	//if bird goes off screen
        if(this.bird.y > game.config.height || this.bird.y < 0){
            this.die();
        }

        //if pipe goes off screen
        this.pipeGroup.getChildren().forEach(function(pipe){
            if(pipe.getBounds().right < 0){
                //add to pipePool
                this.pipePool.push(pipe);
//check 2 pipes to be placed
                if(this.pipePool.length == 2){
                    this.placePipes(true);
                }
            }
        }, this)
    }

    die(){
        localStorage.setItem(gameOptions.localStorageName, Math.max(this.score, this.topScore));
        this.scene.start('PlayGame');
    }
}
