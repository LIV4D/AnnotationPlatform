import { Component, OnInit, Input, Output } from '@angular/core';

@Component({
  selector: 'app-widget-single-line',
  templateUrl: './widget-single-line.component.html',
  styleUrls: ['./widget-single-line.component.scss']
})
export class WidgetSingleLineComponent implements OnInit {
  @Input() label: string;
  @Input() defaultEntryValue: string;
  // @Output() entryField: string;
  constructor() { }

  ngOnInit(): void {
    console.log(this.label);
  }

}
