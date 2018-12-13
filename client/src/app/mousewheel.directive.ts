import { Directive, Output, HostListener, EventEmitter } from '@angular/core';

@Directive({ selector: '[appMouseWheel]' })
export class MouseWheelDirective {
  @Output() mouseWheel = new EventEmitter();

  @HostListener('wheel', ['$event']) onMouseWheelChrome(event: any): void {
    this.mouseWheelFunc(event);
  }

  @HostListener('DOMMouseScroll', ['$event']) onMouseWheelFirefox(event: any): void {
    this.mouseWheelFunc(event);
  }

  @HostListener('onmousewheel', ['$event']) onMouseWheelIE(event: any): void {
    this.mouseWheelFunc(event);
  }

  mouseWheelFunc(event: any): void {
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