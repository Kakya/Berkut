window.onload = function() {
    // You might want to start with a template that uses GameStates:
    //     https://github.com/photonstorm/phaser/tree/master/resources/Project%20Templates/Basic
    
    // You can copy-and-paste the code from any of the examples at http://examples.phaser.io here.
    // You will need to change the fourth parameter to "new Phaser.Game()" from
    // 'phaser-example' to 'game', which is the id of the HTML element where we
    // want the game to go.
    // The assets (and code) can be found at: https://github.com/photonstorm/phaser/tree/master/examples/assets
    // You will need to change the paths you pass to "game.load.image()" or any other
    // loading functions to reflect where you are putting the assets.
    // All loading functions will typically all be found inside "preload()".
    
    "use strict";
    

var game = new Phaser.Game(1200, 800, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.image('backdrop', 'assets/Night_Sky.png');
    game.load.image('card', 'assets/F-22.PNG');
	game.load.image('eagle', 'assets/S-37.PNG');
	game.load.image('bullet', 'assets/Side.png');
	game.load.image('eabullet', 'assets/ESide.png');
	game.load.audio('Musik', ['assets/Air Battle.ogg']);
	game.load.audio('soundOfFreedom', ['assets/F-14 Tomcat fly by with sonic boom.wav', 'assets/F-14 Tomcat fly by with sonic boom.ogg']);
}

var card;
var cursors;
var music;
var eagles;
var eagle;
var bullets;
var fireRate = 100;
var nextFire = 0;
var efireRate = 100;
var enextFire = 0;
var eBullets;
var killedEnemy = 0;
var stateText;
var velocity = 0;
var ctr = 0;
var afterReady = true;
function create() {
	game.physics.startSystem(Phaser.Physics.ARCADE);
    game.world.setBounds(0, 0, 2560, 1600);
    game.add.sprite(0, 0, 'backdrop');
    card = game.add.sprite(200, 200, 'card');
	game.physics.startSystem(Phaser.Physics.P2JS);
	//card.enableBody = true;
	//card.body.clearShapes();
	game.physics.p2.enable(card);
	card.body.setCircle(44);
	//card.arcade.body.setSize(20,20,0,0);
	eagles = game.add.group(); 
	eagles.enableBody = true;
    game.camera.follow(card);
	card.anchor.setTo(0.5, 0.5);
	bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
	bullets.createMultiple(2, 'bullet');
    bullets.setAll('checkWorldBounds', true);
    bullets.setAll('outOfBoundsKill', true);
	eBullets = game.add.group();
    eBullets.enableBody = true;
    eBullets.physicsBodyType = Phaser.Physics.ARCADE;
	eBullets.createMultiple(2, 'eabullet');
    eBullets.setAll('checkWorldBounds', true);
    eBullets.setAll('outOfBoundsKill', true);
    game.physics.enable(card, Phaser.Physics.ARCADE);
	for (var i = 0; i<10; i++)
	{
		var e = eagles.create(card.x+game.rnd.integerInRange(1000,2000), game.world.randomY, 'eagle');
		e.anchor.setTo(0.5, 0.5);
		game.physics.enable(e, Phaser.Physics.ARCADE);
	}
    cursors = game.input.keyboard.createCursorKeys();
    card.body.maxAngular = 4000;

    card.body.angularDrag = 50;
	
    music = game.add.audio('Musik');

   // music.play();
	music = game.add.audio('soundOfFreedom');

  //  music.play();

}

function update() {
	game.physics.arcade.overlap(card, eagles, collide());
    game.physics.arcade.overlap(eagles, eagles);
	//game.physics.arcade.overlap(eagles, bullets, kill, null, this);
	game.physics.arcade.overlap(bullets, eagles, explode, null, this);
	game.physics.arcade.overlap(eBullets, card, pexplode, null, this);
    //card.body.velocity.x = 0;
    //card.body.velocity.y = 0;
    card.body.angularVelocity = 0;

    card.body.angularAcceleration = 0;
	function collide()
	{
		game.physics.arcade.collide(card, eagles);
	}
    if (game.input.keyboard.isDown(Phaser.Keyboard.A))
    {
        //card.body.angularAcceleration -= 2500;
		card.body.rotateLeft(80);
    }
    else if (game.input.keyboard.isDown(Phaser.Keyboard.D))
    {
        //card.body.angularAcceleration += 2500;
		card.body.rotateRight(80);
    }


    if (game.input.keyboard.isDown(Phaser.Keyboard.W))
    {
		card.body.thrust(velocity);
		if(velocity < 3000)
		{
			velocity += 1;
		}
    }
	function burn()
	{
		if (ctr < 11)
		{
			ctr++;
		}
		if(ctr >=10)
		{
			afterReady = false;
		}
	}
	if (game.input.keyboard.isDown(Phaser.Keyboard.W) && game.input.keyboard.isDown(Phaser.Keyboard.SHIFT))
    {
		if(afterReady)
		{
			if(velocity < 3100)
			{
				velocity += 2;
			}
			card.body.thrust(velocity);
			burn();
		}
    }
	if(velocity > 0 )
	{
		velocity = velocity - (0.01*velocity);
	}
	game.world.wrap(card, 0, true);
	eagles.forEach(fly, this, true);
	if(ctr > 0)
	{
		ctr-=0.25;
		if(ctr = 0)
		{
			afterReady = true;
		}
	}
	if (game.input.activePointer.isDown)
    {
        fire();
    }
	eagles.forEach(enemyFires, this, true);
}
function fly(eagle)
{
	
	eagle.body.velocity.x = game.rnd.integerInRange(-100, -300);
	eagle.body.velocity.y = 0;
	game.world.wrap(eagle, 0, true);
}
function kill(eagle)
{
	eagle.kill();
}
function explode(bullet, eagle)
{
	bullet.kill();
	eagle.kill();
	killedEnemy++;
}
function pexplode(bullet, card)
{
	bullet.kill();
	card.kill();
	stateText=game.addText(game.world.centerX, game.world.centerY, "You fought bravely, oh fighter pilot. \n Next time try using ECMs and stop the commies...",{ font: "20px Times New Roman", fill: "#fff", align: "center" });
	stateText.visible = true;
}
function fire() 
{
    if (game.time.now > nextFire && bullets.countDead() > 0)
    {
        nextFire = game.time.now + fireRate;

        var bullet = bullets.getFirstDead();

        bullet.reset(card.x - 8, card.y - 8);
		bullet.body.velocity.x=600;
		bullet.body.velocity.y=9.8;
    }
}
function enemyFires(eagle)
{
	if (game.time.now > enextFire && eBullets.countDead() > 0)
    {
        enextFire = game.time.now + efireRate;

        var eBullet = eBullets.getFirstDead();

        eBullet.reset(eagle.x + 8, eagle.y + 8);
		eBullet.body.velocity.x=-600;
		eBullet.body.velocity.y=9.8;
    }
}
function render() {
	game.debug.text('Planes killed: ' + killedEnemy, 32, 52);
	game.debug.text('Velocity: ' + velocity, 32, 72);
	game.debug.body(card);
	game.debug.text('Afterburner on for: '+ctr, 32, 92);
	game.debug.text('Controls: W: add thrust. D,S: Roll control. Shift+W: Afterburner. Left mouse click: Fire missile.', 112,32);
	game.debug.text('Version 14', 32, 112);
}
};
