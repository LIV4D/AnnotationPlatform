import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { mouseWheelZoom } from 'mouse-wheel-zoom';

@Component({
  selector: 'app-zoomngx',
  templateUrl: './zoomngx.component.html',
  styleUrls: ['./zoomngx.component.scss']
})
export class ZoomngxComponent implements AfterViewInit {

  // myThumbnail = '../../assets/milad-alizadeh-qzEs-9oX8L8-unsplash.jpg';
  // myFullresImage = '../../assets/milad-alizadeh-qzEs-9oX8L8-unsplash.jpg';

  @ViewChild('myCanvas') myCanvas: ElementRef;
  image = new Image();


  constructor() {
    // this.image.src = '../../assets/milad-alizadeh-qzEs-9oX8L8-unsplash.jpg';
    this.image.src = '../../assets/Screenshot 2020-03-05 12.02.17.png';
  }

  ngAfterViewInit(): void {
    this.image.src = '../../assets/Screenshot 2020-03-05 12.02.17.png';
    const context: CanvasRenderingContext2D = this.myCanvas.nativeElement.getContext('2d');

    // showing
    // context.fillRect(0, 0, 1000, 1000);

    // Not showing
    this.image.onload = () => {
      console.log('image has loaded!');
      this.scaleToFit(this.image, context, this.myCanvas.nativeElement);
    };

    const wz = mouseWheelZoom({
      element: document.querySelector('[data-wheel-zoom]'),
      zoomStep: 0.25
    });
  }

  scaleToFit(img, ctx, canvas) {
    // get the scale
    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    // get the top left position of the image
    const x = (canvas.width / 2) - (img.width / 2) * scale;
    const y = (canvas.height / 2) - (img.height / 2) * scale;
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
  }
}
