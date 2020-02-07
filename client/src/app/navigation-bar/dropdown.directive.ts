import { Directive, HostListener, HostBinding, ElementRef, Renderer2, OnInit } from '@angular/core';

@Directive({
  selector: '[appDropdown]'
})

export class DropdownDirective implements OnInit {
  @HostBinding('class.open') isOpen: boolean;

  constructor(private eltRef: ElementRef, private renderer: Renderer2) { }

  ngOnInit() {
    this.isOpen = false;
  }

  //  If we want the dropdown to be closed from anywhere outside of the dropdown list
  @HostListener('document:click', ['$event']) toggleOpen(event: Event) {
    this.isOpen = this.eltRef.nativeElement.contains(event.target) ? !this.isOpen : false;
  }
}
