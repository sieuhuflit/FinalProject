
var game = new Game();

function init() {
	if(game.init())
		game.start();
}


var imageRepository = new function() {
	
	this.background = new Image();
	this.spaceship = new Image();
	this.bullet = new Image();

	// Ensure all images have loaded before starting game
	var numImages = 3;
	var numLoaded = 0;

	function imageLoaded () {
		numLoaded++;
		if (numLoaded == numImages) {
			window.init();
		}
	}

	this.background.onload = function () {
		imageLoaded();
	}

	this.spaceship.onload = function () {
		imageLoaded();
	}

	this.bullet.onload = function () {
		imageLoaded();
	}


	this.background.src = "imgs/test.jpg";
	this.spaceship.src = "imgs/ship.png";
	this.bullet.src = "imgs/bullet.png";
}




function Drawable() {
	this.init = function (x ,y ,width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;	
	}
	this.speed = 0;
	this.canvasWidth = 0;
	this.canvasHeight = 0;
}




function Background () {
	this.speed = 1;

	this.draw = function () {
		this.y += this.speed;
		this.context.drawImage(imageRepository.background , this.x , this.y );
		this.context.drawImage(imageRepository.background , this.x , this.y - this.canvasHeight);

		if (this.y >= this.canvasHeight) {
			this.y = 0;	
		}
	}
}

Background.prototype = new Drawable();




function Bullet () {
	this.alive = false;

	// Set the bullet values
	this.spawn = function (x , y , speed) {
		this.x = x; 
		this.y = y;
		this.speed = speed;
		this.alive = true;
	}

	this.draw = function () {
		this.context.clearRect(this.x , this.y ,this.width , this.height);
		this.y -= this.speed;

		if (this.y <= 0 - this.height) {
			return true;
		}
		else {
			this.context.drawImage(imageRepository.bullet , this.x , this.y);
		}
	}

	// Reset the bullet values
	this.clear = function () {
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.alive = false;
	}
}

Bullet.prototype = new Drawable();





function Pool (maxSize) {
	var size = maxSize;		// Max bullet allow in the Pool
	var pool = [];

	this.init = function () {
		for (var i = 0 ; i < size ; i++) {
			var bullet =  new Bullet();
			bullet.init(0 , 0 , imageRepository.bullet.width , imageRepository.bullet.height);
			pool[i] = bullet;
		}
	}

	this.get = function (x, y ,speed) {
		if (!pool[size - 1].alive) {
			pool[size - 1].spawn(x, y ,speed);

			// this.spawn = function (x , y , speed) {
			// 	this.x = x; 
			// 	this.y = y;
			// 	this.speed = speed;
			// 	this.alive = true;
			// }

			pool.unshift(pool.pop());

			// var fruits = ["Banana", "Orange", "Apple", "Mango"];
			// fruits.pop();
			// The result of fruits will be:

			// Banana,Orange,Apple

			// -----------------------------------------------------

			// var fruits = ["Banana", "Orange", "Apple", "Mango"];
			// fruits.unshift("Lemon","Pineapple");
			// The result of fruits will be:

			// Lemon,Pineapple,Banana,Orange,Apple,Mango
		}
	}

	this.getTwo = function (x1, y1, speed1, x2, y2, speed2) {
		if (!pool[size - 1].alive && !pool[size - 2].alive) {
			this.get(x1, y1, speed1);
			this.get(x2, y2, speed2);
		}
	}

	this.animate = function () {
		for (var i = 0 ; i < size ; i++) {
			if (pool[i].alive) {
				if (pool[i].draw()) {

					pool[i].clear();
					pool.push( (pool.splice(i,1)) [0] );

					// var fruits = ["Banana", "Orange", "Apple", "Mango"];
					// fruits.splice(2,1,"Lemon","Kiwi");
					// The result of fruits will be:

					// Banana,Orange,Lemon,Kiwi,Mango
				}
			}
			else 
				break;
		}
	}
}



/**
 * Create the Ship object that the player controls. The ship is
 * drawn on the "ship" canvas and uses dirty rectangles to move
 * around the screen.
 */
function Ship() {
	this.speed = 3;
	this.bulletPool = new Pool(8);
	this.bulletPool.init();

	var fireRate = 15;
	var counter = 0;
	
	this.draw = function() {
		this.context.drawImage(imageRepository.spaceship, this.x, this.y);
	};
	this.move = function() {	
		counter++;
		// Determine if the action is move action
		if (KEY_STATUS.left || KEY_STATUS.right ||
			KEY_STATUS.down || KEY_STATUS.up) {
			// The ship moved, so erase it's current image so it can
			// be redrawn in it's new location
			this.context.clearRect(this.x, this.y, this.width, this.height);
			
			// Update x and y according to the direction to move and
			// redraw the ship. Change the else if's to if statements
			// to have diagonal movement.
			if (KEY_STATUS.left) {
				this.x -= this.speed
				if (this.x <= 0) // Keep player within the screen
					this.x = 0;
			} else if (KEY_STATUS.right) {
				this.x += this.speed
				if (this.x >= this.canvasWidth - this.width)
					this.x = this.canvasWidth - this.width;
			} else if (KEY_STATUS.up) {
				this.y -= this.speed
				if (this.y <= this.canvasHeight/4*3)
					this.y = this.canvasHeight/4*3;
			} else if (KEY_STATUS.down) {
				this.y += this.speed
				if (this.y >= this.canvasHeight - this.height)
					this.y = this.canvasHeight - this.height;
			}
			
			// Finish by redrawing the ship
			this.draw();
		}
		
		if (KEY_STATUS.space && counter >= fireRate) {
			this.fire();
			counter = 0;
		}
	};
	
	/*
	 * Fires two bullets
	 */
	this.fire = function() {
		this.bulletPool.getTwo(this.x+6, this.y, 3,
		                       this.x+33, this.y, 3);
	};
}
Ship.prototype = new Drawable();




 /**
 * Creates the Game object which will hold all objects and data for
 * the game.
 */
function Game() {
	
	this.init = function() {

		this.bgCanvas = document.getElementById('background');
		this.shipCanvas = document.getElementById('ship');
		this.mainCanvas = document.getElementById('main');
		
		if (this.bgCanvas.getContext) {
			this.bgContext = this.bgCanvas.getContext('2d');
			this.shipContext = this.shipCanvas.getContext('2d');
			this.mainContext = this.mainCanvas.getContext('2d');
		
			Background.prototype.context = this.bgContext;
			Background.prototype.canvasWidth = this.bgCanvas.width;
			Background.prototype.canvasHeight = this.bgCanvas.height;
			
			Ship.prototype.context = this.shipContext;
			Ship.prototype.canvasWidth = this.shipCanvas.width;
			Ship.prototype.canvasHeight = this.shipCanvas.height;
			
			Bullet.prototype.context = this.mainContext;
			Bullet.prototype.canvasWidth = this.mainCanvas.width;
			Bullet.prototype.canvasHeight = this.mainCanvas.height;
			
			this.background = new Background();
			this.background.init(0,0); // Set draw point to 0,0
			
			this.ship = new Ship();

			var shipStartX = this.shipCanvas.width/2 - imageRepository.spaceship.width;
			var shipStartY = this.shipCanvas.height/4*3 + imageRepository.spaceship.height*2;
			this.ship.init(shipStartX, shipStartY, imageRepository.spaceship.width,
			               imageRepository.spaceship.height);

			return true;
		} else {
			return false;
		}
	};
	
	// Start the animation loop
	this.start = function() {
		this.ship.draw();
		animate();
	};
}




/**
 * The animation loop. Calls the requestAnimationFrame shim to
 * optimize the game loop and draws all game objects. This
 * function must be a gobal function and cannot be within an
 * object.
 */
function animate() {
	requestAnimFrame( animate );
	game.background.draw();
	game.ship.move();
	game.ship.bulletPool.animate(); 
}





// The keycodes that will be mapped when a user presses a button.
// Original code by Doug McInnes
KEY_CODES = {
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
}



// Creates the array to hold the KEY_CODES and sets all their values
// to false. Checking true/flase is the quickest way to check status
// of a key press and which one was pressed when determining
// when to move and which direction.
KEY_STATUS = {};
for (code in KEY_CODES) {
  KEY_STATUS[KEY_CODES[code]] = false;
}



/**
 * Sets up the document to listen to onkeydown events (fired when
 * any key on the keyboard is pressed down). When a key is pressed,
 * it sets the appropriate direction to true to let us know which
 * key it was.
 */
document.onkeydown = function(e) {
  // Firefox and opera use charCode instead of keyCode to
  // return which key was pressed.
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
	e.preventDefault();
	KEY_STATUS[KEY_CODES[keyCode]] = true;
  }
}
/**
 * Sets up the document to listen to ownkeyup events (fired when
 * any key on the keyboard is released). When a key is released,
 * it sets teh appropriate direction to false to let us know which
 * key it was.
 */
document.onkeyup = function(e) {
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
    e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = false;
  }
}


/**	
 * requestAnim shim layer by Paul Irish
 * Finds the first API that works to optimize the animation loop, 
 * otherwise defaults to setTimeout().
 */
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame    || 
			window.oRequestAnimationFrame      || 
			window.msRequestAnimationFrame     || 
			function(/* function */ callback, /* DOMElement */ element){
				window.setTimeout(callback, 1000 / 60);
			};
})();