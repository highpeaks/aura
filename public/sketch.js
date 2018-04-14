
var video;
var prevFrame = [];
var c;
var counter = true;
var vscale = 20;
var threshold = 35;
var xvals = [];
var yvals = [];


function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}


function setup() {
	var c = createCanvas(windowWidth, windowHeight);
  c.parent("#canvas");
	video = createCapture(VIDEO);
	video.size(width/vscale, height/vscale);
	video.hide();
  v = new vehicle();
  target = createVector(0,0);
}


function draw() {
	background(35,39,42);
	vision();
  v.seek(target);
  v.update();
  v.show();
}


function vision(){

  // a switch that populates an array with a length of 2
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

    // loop through pixel array
		for (let y = 0; y < video.height; y++){
			for (let x = 0; x < video.width; x++){

        // index value for each pixel
				let i = (video.width - (x + 1) + (y * video.width)) * 4;

        // red channel for current and previous frame
				let r1 = video.pixels[i];
				let r2 = c.pixels[i];

        // difference between red channel value from previous to current frame
        let d = distSq(r1,r2);


        // if difference is greater than threshold
				if(d >= threshold * threshold) {
          //gray boxes for visual feedback
          fill(44,47,51);
					noStroke();
					rect(x*vscale, y*vscale, vscale, vscale);
          // array of x and y values where motion was detected
          xvals.push(x*vscale);
          yvals.push(y*vscale);
				}
			}
		}

    if (xvals.length > 1) {

      // remove outliers in xvals array
      for (let j = 0; j < xvals.length; j++){
        if (xvals[j] < ss.quantile(xvals, 0.4) || xvals[j] > ss.quantile(xvals, 0.6)){
          xvals.splice(j,1);
          yvals.splice(j,1);
        }
      }

      // remove outliers in yvals array
      for (let k = 0; k < yvals.length; k++){
        if (yvals[k] < ss.quantile(yvals, 0.4875) || yvals[k] > ss.quantile(yvals, 0.5125)){
          xvals.splice(k,1);
          yvals.splice(k,1);
        }
      }

      // average location for each array
      target.x = ss.mean(xvals);
      target.y = ss.mean(yvals);
    }

    // keep array length near 75
    if (xvals.length > 75) {
      xvals.splice(0, xvals.length - 75);
      yvals.splice(0, yvals.length - 75);
	  }
  }
}


class vehicle {

	constructor(){
		this.acceleration = createVector(0,0);
		this.velocity = createVector(0,0);
		this.position = createVector(width * 0.5, height * 0.5);
		this.maxspeed = 10;
		this.maxforce = 1;
    this.seeking = true;
	}

	seek(t){

    this.target = t;

    // A vector pointing from the position to the target
    this.desired = this.target.sub(this.position);

    this.d = this.desired.mag();

    // Slow down when close
    this.m = map(this.d, 0, 25, 0, this.maxspeed);
    this.desired.setMag(this.m);

    // Steering = Desired minus velocity
    this.steer = this.desired.sub(this.velocity);

    // Limit to maximum steering force
    this.steer.limit(this.maxforce);
    this.acceleration.add(this.steer);
  }

	update(){

		// Update velocity
    this.velocity.add(this.acceleration);

		// Limit speed
		this.velocity.limit(this.maxspeed);

    // Apply to Vehicle
		this.position.add(this.velocity);

    // Reset accelerationelertion to 0 each cycle
    this.acceleration.mult(0);
  }

	show(){
    noStroke();
    fill(204, 255, 0);
    ellipse(this.position.x, this.position.y, 20);
	}
}


function distSq(x1,x2) {
  d = (x2-x1)*(x2-x1);
  return d;
}
