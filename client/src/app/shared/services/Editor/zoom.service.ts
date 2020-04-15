import { Injectable } from '@angular/core';

// Min and max values for zooming
const ZOOM = {
	MIN: 1.0,
	MAX: 16.0,
};

@Injectable({
  providedIn: 'root',
})
export class ZoomService {
	zoomFactor: number;
	ZOOM = ZOOM;

	constructor(){}

  	public capZoomValues(zoomFactor: number): number{
		if (zoomFactor > 1){
		zoomFactor = 1;
		}
		else if (zoomFactor < 0){
			zoomFactor = 0;
		}
    	zoomFactor = ZOOM.MAX * zoomFactor + ZOOM.MIN;
    	return zoomFactor;
  }

  // Change the zoom factor depending the differential
	public updateZoomFactor(delta: number){
		// Keep zoom in range [100%, 600%]
		let zoomFactor = this.zoomFactor * Math.exp(delta); // exp is used for acceleration
	  	// let zoomFactor = this.zoomFactor * (2 / (1 + Math.exp(delta)));

	  	// Capture the values.
	  	if (zoomFactor > ZOOM.MAX) {
			zoomFactor = ZOOM.MAX;
	  	} else if (zoomFactor < ZOOM.MIN) {
			zoomFactor = ZOOM.MIN;
	  	}
	  	this.zoomFactor = zoomFactor;
  }
}

