import { Component, ViewChild, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-zoomngx',
  templateUrl: './zoomngx.component.html',
  styleUrls: ['./zoomngx.component.scss']
})
export class ZoomngxComponent implements AfterViewInit {

  @ViewChild('myCanvas') myCanvas: ElementRef;
  @ViewChild('sizeImage') sizeImage: ElementRef;
  image = new Image();


  constructor(private renderer: Renderer2) {
    this.image.src = '../../assets/milad-alizadeh-qzEs-9oX8L8-unsplash.jpg';
    // this.image.src = '../../assets/Screenshot 2020-03-05 12.02.17.png';
  }

  ngAfterViewInit(): void {
    // this.image.src = '../../assets/Screenshot 2020-03-05 12.02.17.png';
    this.image.src = '../../assets/milad-alizadeh-qzEs-9oX8L8-unsplash.jpg';
    const context: CanvasRenderingContext2D = this.myCanvas.nativeElement.getContext('2d');

    this.image.onload = () => {
      this.scaleToFit(this.image, context, this.myCanvas.nativeElement);
    };
  }

  scaleToFit(img, ctx, canvas) {
    // get the scale
    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    // get the top left position of the image
    const x = (canvas.width / 2) - (img.width / 2) * scale;
    const y = (canvas.height / 2) - (img.height / 2) * scale;
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
  }

  onMouseWheel(e: WheelEvent): void {
    // console.log('%c ZoomngxComponent::onMouseWheel()', 'color:black; background:yellow;');
    // console.log('%c width ' + this.myCanvas.nativeElement.getContext('2d') , 'color:black; background:yellow;');
    this.ScrollZoom(e, this.sizeImage);
  }

  onMouseOver(e: Event) {
  }


  // tslint:disable-next-line: variable-name
  ScrollZoom(e, container, max_scale = 7, factor = 0.095) {

    // const target = container.children().first();
    const target = container.nativeElement;
    const size = {
      w: target.width,
      h: target.height
    };

    const pos = {x: 0, y: 0};
    // tslint:disable-next-line: variable-name
    const zoom_target = {x: 0, y: 0};
    // tslint:disable-next-line: variable-name
    const zoom_point = {x: 0, y: 0};
    let scale = 4;

    // target.css('transform-origin', '0 0');
    this.renderer.setStyle(target, 'transform-origin', '0 0');
    // target.on('mousewheel DOMMouseScroll', scrolled);

    // function scrolled(e) {
    // tslint:disable-next-line: prefer-const
    // let offset = container.offset();
    const offset = container.nativeElement.getBoundingClientRect();
    zoom_point.x = e.pageX - offset.left;
    zoom_point.y = e.pageY - offset.top;

    e.preventDefault();
    let delta = e.delta; // || e.originalEvent.wheelDelta;
    // if (delta === undefined) {
    //     // we are on firefox
    //     delta = e.originalEvent.detail;
    // }
    delta = Math.max(-1, Math.min(1, delta)); // cap the delta to [-1,1] for cross browser consistency

    // determine the point on where the slide is zoomed in
    zoom_target.x = (zoom_point.x - pos.x) / scale;
    zoom_target.y = (zoom_point.y - pos.y) / scale;

    // apply zoom
    scale += delta * factor * scale;
    scale = Math.max(1, Math.min(max_scale, scale));

    // calculate x and y based on zoom
    pos.x = -zoom_target.x * scale + zoom_point.x;
    pos.y = -zoom_target.y * scale + zoom_point.y;


      // Make sure the slide stays in its container area when zooming out
    if (pos.x > 0) {
        pos.x = 0;
    }
    if (pos.x + size.w * scale < size.w) {
      pos.x = -size.w * (scale - 1);
    }
    if (pos.y > 0) {
        pos.y = 0;
    }
    if (pos.y + size.h * scale < size.h) {
      pos.y = -size.h * (scale - 1);
    }

    // update(target);
  // }

    // function update(target) {
      // target.css('transform', 'translate(' + (pos.x) + 'px,' + (pos.y) + 'px) scale(' + scale + ',' + scale + ')');
    this.renderer.setStyle(target,
      'transform', 'translate(' + (pos.x) + 'px,' + (pos.y) + 'px) scale(' + scale + ',' + scale + ')');
    // }
  }

}
