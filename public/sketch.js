var video, prevVideo;
var prevFrame = [];
var counter = true;
var vscale = 20;
var threshold = 40;
var eps = 75;
var minPts = 10;
var point_data = [];
var target;
var v;

function windowResized(){
    resizeCanvas(windowWidth, windowHeight);
}


function setup() {
	var c = createCanvas(windowWidth, windowHeight);
    c.parent("#canvas");
    pixelDensity(1);
    video = createCapture(VIDEO);
	video.size(width/vscale, height/vscale);
	video.hide();
    v = new vehicle();
    target = createVector(0,0);
}


function draw() {
    background(35,39,42);
    title();
    vision();
}


function title(){
    push();
//    fill(44,47,51);
    fill(255);
    textFont("Source Code Pro");
    textSize(25);
    textAlign(CENTER);
    text("auras", width * 0.5, height - 50);
    pop();    
}


function vision(){
    
    // a switch that populates an array with a length of 2
	counter = !counter;

	if (counter){
        prevFrame[0] = video.get();
        if (frameCount > 2){
            prevFrame[1].loadPixels();
			prevVideo = prevFrame[1];
		}
    } else {
		prevFrame[1] = video.get();
		if (frameCount > 2){
            prevFrame[0].loadPixels();
			prevVideo = prevFrame[0];
		}
	}

	if(frameCount>2) {

    let counter = 0;

    // loop through pixel array
        for (let y = 0; y < video.height; y++){
            for (let x = 0; x < video.width; x++){

                // index value for each pixel
				let i = (video.width - (x + 1) + (y * video.width)) * 4;

                // red channel for current and previous frame
				let r1 = video.pixels[i];
				let r2 = prevVideo.pixels[i];

                // difference between red channel value from previous to current frame
                let d = distSq(r1,r2);

                // if difference is greater than threshold
                if(d >= threshold * threshold) {
                    
                    let xp = x * vscale;
                    let yp = y * vscale;

                    //gray boxes for visual feedback
                    fill(44,47,51);
					noStroke();
					rect(xp, yp, vscale, vscale);

                    //array of points where motion occurs
                    let foundPoint = {"x": xp, "y": yp};
                    point_data.push(foundPoint);
                }
            }
        }
    }

    let dbscanner = jDBSCAN().eps(eps).minPts(minPts).distance('EUCLIDEAN').data(point_data);
    let point_assignment_result = dbscanner();
    let cluster_centers = dbscanner.getClusters();

    if (cluster_centers.length > 0) {

        let highscore = 0;

        for (let i = 0; i < cluster_centers.length; i++) {

            if (cluster_centers[i].dimension > highscore) {
                highscore = cluster_centers[i].dimension;
                target.set(cluster_centers[i].x, cluster_centers[i].y);
                stroke(204, 255, 0);
            } else {
                stroke(255);
            }
            
            noFill();
            strokeWeight(2);
            ellipse(cluster_centers[i].x, cluster_centers[i].y, cluster_centers[i].dimension);
        }
        v.seek(target);
    }
    v.update();
    v.show();
    point_data = [];
}


class vehicle {

    constructor(){
        this.acceleration = createVector(0,0);
		this.velocity = createVector(0,0);
		this.position = createVector(width * 0.5, height * 0.5);
		this.maxspeed = 10;
		this.maxforce = 5;
        this.seeking = true;
	}

    seek(t){

        this.target = t;

        // A vector pointing from the position to the target
        this.desired = this.target.sub(this.position);

        this.d = this.desired.mag();

        // Slow down when close
        this.m = map(this.d, 0, 150, 0, this.maxspeed);

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
