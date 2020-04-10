import { Directive, Output, HostListener, EventEmitter } from '@angular/core';

@Directive({
  selector: '[appMousewheel]'
})
export class MousewheelDirective {

  @Output() mouseWheel = new EventEmitter();

  @HostListener('wheel', ['$event']) onMouseWheelChrome(event: any): void {
    // console.log('onMouseWheelChrome');

    this.mouseWheelFunc(event);
  }

  @HostListener('DOMMouseScroll', ['$event']) onMouseWheelFirefox(event: any): void {
    // console.log('onMouseWheelFirefox');

    this.mouseWheelFunc(event);
  }

  @HostListener('onmousewheel', ['$event']) onMouseWheelIE(event: any): void {
    // console.log('onMouseWheelIE');

    this.mouseWheelFunc(event);
  }

  mouseWheelFunc(event: any): void {
    // console.log('MouseWheelDirective::mouseWheelFunc');

    event = window.event || event; // old IE support
    this.mouseWheel.emit(event);
    // for IE
    event.returnValue = false;
    // for Chrome and Firefox
    if (event.preventDefault) {
      event.preventDefault();
    }
  }

}
