import { WidgetMultipleLinesComponent } from './widgetTypes/widget-multiple-lines/widget-multiple-lines.component';
import { WidgetSingleLineComponent } from './widgetTypes/widget-single-line/widget-single-line.component';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss']
})
export class WidgetComponent implements OnInit {

  taskId = 0;
  label = '';
  type = '';
  defaultEntryValue = '';
  validationRegex = '';
  entryField = 'allo';

  constructor() { }

  ngOnInit(): void {
  }



}
