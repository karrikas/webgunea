var game, wWdith, wHeight;
var currentLevel = 1;
var touchValue = 0;
var speed = 10;


$(document).ready(function(){
    wWdith = $(window).width();
    wHeight = $(window).height();

    if (600 < wWdith) {
        wWdith = 600;
    }

    if (300 < wHeight) {
        speed = 15* (wHeight / 300);
    }
    console.log(speed);

    game = new Phaser.Game(wWdith, wHeight, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update });
})

var IDE_HOOK = false;
var VERSION = '2.6.2';

function preload() {
    game.load.atlas('breakout', '/breakout/assets/breakout.png', '/breakout/assets/breakout.json');
    game.load.image('starfield', '/breakout/assets/misc/starfield.jpg');
    $("#phaser-example canvas").css({"margin": "0 auto"});
}

var ball;
var paddle;
var bricks;

var ballOnPaddle = true;

var lives = 3;
var score = 0;

var scoreText;
var livesText;
var introText;

var string = {
    lives: 'bizitza',
    score: 'puntuak',
    start: 'ikutu hasteko',
}

var s;

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  We check bounds collisions against all walls other than the bottom one
    game.physics.arcade.checkCollision.down = false;

    s = game.add.tileSprite(0, 0, wWdith, wHeight, 'starfield');

    setLevel();

    paddle = game.add.sprite(game.world.centerX, wHeight-120, 'breakout', 'paddle_big.png');
    paddle.anchor.setTo(0.5, 0.5);

    game.physics.enable(paddle, Phaser.Physics.ARCADE);

    paddle.body.collideWorldBounds = true;
    paddle.body.bounce.set(1);
    paddle.body.immovable = true;

    ball = game.add.sprite(game.world.centerX, paddle.y - 16, 'breakout', 'ball_1.png');
    ball.anchor.set(0.5);
    ball.checkWorldBounds = true;

    game.physics.enable(ball, Phaser.Physics.ARCADE);

    ball.body.collideWorldBounds = true;
    ball.body.bounce.set(1);

    ball.animations.add('spin', [ 'ball_1.png', 'ball_2.png', 'ball_3.png', 'ball_4.png', 'ball_5.png' ], 50, true, false);

    ball.events.onOutOfBounds.add(ballLost, this);

    scoreText = game.add.text(32, wHeight-100, string.score+': 0', { font: "20px Arial", fill: "#ffffff", align: "left" });
    livesText = game.add.text(wWdith-110, wHeight-100, string.lives+': 3', { font: "20px Arial", fill: "#ffffff", align: "left" });
    introText = game.add.text(game.world.centerX, game.world.centerY, '- '+string.start+' -', { font: "40px Arial", fill: "#ffffff", align: "center" });
    introText.anchor.setTo(0.5, 0.5);
    // infoText = game.add.text(game.world.centerX, game.world.centerY+50, '- '+string.start+' -', { font: "20px Arial", fill: "#ffffff", align: "center" });
    // infoText.anchor.setTo(0.5, 0.5);

    game.input.onDown.add(releaseBall, this);

}

function update () {

    //  Fun, but a little sea-sick inducing :) Uncomment if you like!
    // s.tilePosition.x += (game.input.speed.x / 2);

    paddle.x = game.input.x;

    if (paddle.x < 24)
    {
        paddle.x = 24;
    }
    else if (paddle.x > game.width - 24)
    {
        paddle.x = game.width - 24;
    }

    if (ballOnPaddle)
    {
        ball.body.x = paddle.x;
    }
    else
    {
        game.physics.arcade.collide(ball, paddle, ballHitPaddle, null, this);
        game.physics.arcade.collide(ball, bricks, ballHitBrick, null, this);
    }

}

function releaseBall () {

    if (ballOnPaddle)
    {
        ballOnPaddle = false;
        ball.body.velocity.y = -10 * speed;
        ball.body.velocity.x = -75;
        ball.animations.play('spin');
        introText.visible = false;
    }

}

function ballLost () {

    lives--;
    livesText.text = string.lives+': ' + lives;
    touchValue = 0;

    if (lives === 0)
    {
        gameOver();
    }
    else
    {
        ballOnPaddle = true;

        ball.reset(paddle.body.x + 16, paddle.y - 16);
        
        ball.animations.stop();
    }

}

function gameOver () {

    ball.body.velocity.setTo(0, 0);
    
    introText.text = 'Jokoa amaitu da!';
    introText.visible = true;

}

function updateScoreText() {
    scoreText.text = string.score+': ' + score;
}

function ballHitBrick (_ball, _brick) {

    _brick.kill();

    touchValue++;
    score += 20*(0.5*touchValue);

    updateScoreText();

    //  Are they any bricks left?
    if (bricks.countLiving() == 0)
    {
        //  Let's move the ball back to the paddle
        ballOnPaddle = true;
        ball.body.velocity.set(0);
        ball.x = paddle.x + 16;
        ball.y = paddle.y - 16;
        ball.animations.stop();

        //  And bring the bricks back from the dead :)
        // bricks.callAll('revive');
        //  New level starts
        currentLevel++;
        score += (1000*currentLevel);
        updateScoreText();

        if (6 == currentLevel) {
            introText.text = 'Zorionak, jokoa amaitu duzu!';
            ball.body.velocity.setTo(0, 0);
        } else {
            introText.text = currentLevel+'. Maila!';
            setLevel();
        }
        introText.visible = true;
    }
}

function ballHitPaddle (_ball, _paddle) {

    var diff = 0;
    touchValue = 0;

    if (_ball.x < _paddle.x)
    {
        //  Ball is on the left-hand side of the paddle
        diff = _paddle.x - _ball.x;
        _ball.body.velocity.x = (-1 * speed * diff);
    }
    else if (_ball.x > _paddle.x)
    {
        //  Ball is on the right-hand side of the paddle
        diff = _ball.x -_paddle.x;
        _ball.body.velocity.x = (1 * speed * diff);
    }
    else
    {
        //  Ball is perfectly in the middle
        //  Add a little random X to stop it bouncing straight up!
        _ball.body.velocity.x = 2 + Math.random() * speed;
    }
    console.log(_ball.body.velocity.x, _ball.body.velocity.y);

}

function setLevel() {
    bricks = game.add.group();
    bricks.enableBody = true;
    bricks.physicsBodyType = Phaser.Physics.ARCADE;

    switch(currentLevel) {
        case 5:
            var brickPositions = level5();
            break;
        case 4:
            var brickPositions = level4();
            break;
        case 3:
            var brickPositions = level3();
            break;
        case 2:
            var brickPositions = level2();
            break;
        case 1:
            var brickPositions = level1();
            break;
    }

    if (500 > wWdith) {
        var initX = (wWdith-(10*32))/2;
        var brickMargin = 32;
    } else {
        var brickMargin = (wWdith-200)/10;
        var initX = 100+(brickMargin/2)-(32/2);
    }

    brickPositions.forEach(function(lerroa, indexY) {
        lerroa.forEach(function(el, indexX) {
            if (0 == el) {
                return; // continue
            }

            var posX = initX + (indexX * brickMargin);
            var posY = 80 + (indexY * 25);
            brick = bricks.create(posX, posY, 'breakout', 'brick_' + el + '_1.png');
            brick.body.bounce.set(1);
            brick.body.immovable = true;
        });
    });
}

function level5() {
    return [
        [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        [0, 1, 2, 1, 3, 1, 4, 1, 0, 1],
        [1, 0, 1, 0, 2, 0, 1, 0, 1, 0],
        [0, 1, 2, 1, 3, 1, 4, 1, 0, 1],
        [1, 0, 1, 0, 2, 0, 1, 0, 1, 0],
        [0, 1, 2, 1, 3, 1, 4, 1, 0, 1],
        [1, 0, 1, 0, 2, 0, 1, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [2, 2, 0, 0, 0, 0, 0, 0, 2, 2],
        [2, 2, 0, 0, 0, 0, 0, 0, 2, 2],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [2, 2, 3, 3, 4, 4, 3, 3, 2, 2],
    ];
}

function level4() {
    return [
        [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
        [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [4, 1, 0, 0, 0, 0, 0, 0, 1, 4],
        [1, 4, 1, 0, 0, 0, 0, 1, 4, 1],
        [2, 1, 4, 1, 0, 0, 1, 4, 1, 2],
        [1, 2, 1, 4, 1, 1, 4, 1, 2, 1],
    ];
}

function level3() {
    return [
        [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        [2, 3, 3, 3, 3, 3, 3, 3, 3, 2],
        [1, 2, 3, 3, 3, 3, 3, 3, 2, 1],
        [0, 1, 2, 3, 3, 3, 3, 2, 1, 0],
        [0, 0, 1, 2, 3, 3, 2, 1, 0, 0],
        [0, 0, 0, 1, 2, 2, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
    ];
}

function level2() {
    return [
        [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 2, 0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 2, 0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 2, 0, 1, 0, 1, 0],
    ];
}

function level1() {
    return [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
        [4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
        [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
        [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    ];
}
