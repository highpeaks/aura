
var video;
var prevFrame = [];
var c;
var counter = true;
var slider;
var vscale = 8;


function setup() {

	createCanvas(640, 480);
	background(100);

	video = createCapture(VIDEO);
	video.size(640, 480);
	video.size(width/vscale, height/vscale);
	video.hide();

	slider = createSlider(0,50,25);
}


function draw() {
		
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

	if(frameCount>2){

		for (var y = 0; y < video.height; y++){
			for (var x = 0; x < video.width; x++){
			
			var i = (x + y * video.width) * 4;

			var r1 = video.pixels[i];
			var g1 = video.pixels[i+1];
			var b1 = video.pixels[i+2];

			var r2 = c.pixels[i];
			var g2 = c.pixels[i+1];
			var b2 = c.pixels[i+2];

			var d = distSq(r1,g1,b1,r2,g2,b2);

			var threshold = slider.value();

			if(d >= threshold * threshold) {
				fill(0);
				rect(x*vscale,y*vscale,vscale,vscale);
			} else {
				fill(255);
				rect(x*vscale,y*vscale,vscale,vscale);
			}

			}
		}
	}
}

function distSq(x1, y1, z1, x2, y2, z2) {
  d = (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1) + (z2-z1)*(z2-z1);
  return d;
}