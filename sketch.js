
var video;
var prevFrame = [];
var c;
var counter = true;
var vscale = 10;
var threshold = 60;
var xvals = [];
var yvals = [];
var target, v;

function preload(){
  w = document.getElementById('canvas').offsetWidth;
  h = document.getElementById('canvas').offsetHeight;
}


function windowResized(){
  w = document.getElementById('canvas').offsetWidth;
  h = document.getElementById('canvas').offsetHeight;
  resizeCanvas(w, h);
}


function setup() {
	var c = createCanvas(w, h);
  c.parent("#canvas");
	video = createCapture(VIDEO);
	video.size(width/vscale, height/vscale);
	video.hide();
  v = new vehicle();
  target = createVector(0, 0);
}


function draw() {

	background(35,39,42);

	push();
	let ratio = width/height;
	for (let i = 0; i < height; i = i + 15){
		noStroke();
		fill(153,170,181,2);
		rectMode(CENTER);
		rect(width * 0.5, height * 0.5, i * ratio, i)
	}
	pop();

	vision();

  v.seek(target);
  v.update();
  v.show();
}


class vehicle {

	constructor(){
		this.acceleration = createVector(0,0);
		this.velocity = createVector(0,0);
		this.position = createVector(width * 0.5, height * 0.5);
		this.maxspeed = 10;
		this.maxforce = 1;
	}

	seek(t){

		this.target = t;

		// A vector pointing from the position to the target
    this.desired = this.target.sub(this.position);
    this.d = this.desired.mag();

    // Slow down when close
    this.m = map(this.d,0,500,0,this.maxspeed);
    this.desired.setMag(this.m);

    // Scale to maximum speed
    // this.desired.setMag(this.maxspeed);


    // Steering = Desired minus velocity
    this.steer = this.desired.sub(this.velocity);

		// Limit to maximum steering force
    this.steer.limit(this.maxforce);
		this.acceleration.add(this.steer);

  }

	// Method to update position
	update(){
		// Update velocity
		this.velocity.add(this.acceleration);
		// Limit speed
		this.velocity.limit(this.maxspeed);
		this.position.add(this.velocity);
		// Reset accelerationelertion to 0 each cycle
		this.acceleration.mult(0);
	}

	show(){
    this.r = map(this.m, 0, this.maxspeed, 50, 10);
		fill(114,137,218,100);
		noStroke();
		ellipse(this.position.x, this.position.y, this.r);
	}


}


function vision(){

	counter = !counter;

	if (counter){
		prevFrame[0] = video.get();
		if (frameCount > 2){
			prevFrame[1].loadPixels();
			c = prevFrame[1];
		}
	} else {
		prevFrame[1] = video.get();
		if (frameCount > 2){
			prevFrame[0].loadPixels();
			c = prevFrame[0];
		}
	}

	if(frameCount>2) {

		for (let y = 0; y < video.height; y++){
			for (let x = 0; x < video.width; x++){

				let i = (video.width - (x + 1) + (y * video.width)) * 4;

				let r1 = video.pixels[i];
				let g1 = video.pixels[i+1];
				let b1 = video.pixels[i+2];

				let r2 = c.pixels[i];
				let g2 = c.pixels[i+1];
				let b2 = c.pixels[i+2];

				let bright = (r1+g1+b1)/3;

				let d = distSq(r1,g1,b1,r2,g2,b2);

				if(d >= threshold * threshold) {
					fill(35,39,42,bright);
					noStroke();
					rect(x*vscale, y*vscale, vscale, vscale);
					xvals.push(x*vscale);
					yvals.push(y*vscale);
				}
			}
		}
	}

	let xl = xvals.length;
	let yl = yvals.length;

  target.x = (xvals.reduce(function(a, b) { return a + b; }, 0)) / xl;
	target.y = (yvals.reduce(function(a, b) { return a + b; }, 0)) / yl;


	if (xvals.length > 2000){
		xvals.splice(0,500);
		yvals.splice(0,500);
	}

  if (xvals.length > 10000){
    xvals = [];
    yvals = [];
  }
}


function distSq(x1, y1, z1, x2, y2, z2) {
  d = (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1) + (z2-z1)*(z2-z1);
  return d;
}
