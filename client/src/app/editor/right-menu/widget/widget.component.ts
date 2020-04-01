import { WidgetMultipleLinesComponent } from './widgetTypes/widget-multiple-lines/widget-multiple-lines.component';
import { WidgetSingleLineComponent } from './widgetTypes/widget-single-line/widget-single-line.component';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { WidgetFacadeService } from './widget.facade.service';
import { Task } from 'src/app/shared/models/serverModels/task.model';
import { Widget } from 'src/app/shared/models/serverModels/widget.model';
import * as _ from 'underscore';

@Component({
  selector: 'app-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss']
})
export class WidgetComponent implements OnInit, AfterViewInit {

  taskId = 0;
  label = '';
  type = '';
  defaultEntryValue = '';
  validationRegex = '';
  entryField = 'allo';
  private task : Task;
  private widgets: Widget[];

  // this would be the array of all widgets that we receive from t he server
  private test = [
    {    date:'30-60-90 Day', Name:'Kim', amount:415     },
    {   date:'30-60-90 Day', Name:'Kelly', amount:175     },
    {   date:'30 Day', Name:'Shelly', amount:400     },
    {   date:'30 Day', Name:'Sarvesh', amount:180     }
  ];

  // sort them by widget type
  private grouped: any;

  // this would be an array of only single line widgets for example
  private kim: any;

  constructor(private facadeService: WidgetFacadeService) { }

  ngOnInit(): void {
      this.task = this.facadeService.getCurrentTask();
      this.widgets = this.task.widgets;
  }

  ngAfterViewInit(): void {

    // console.log(_.groupBy(this.test, 'Name'));
    this.grouped = _.groupBy(this.test, 'Name');
    this.kim = this.grouped['Kim'];
    console.log(this.kim);
    // console.log(_.groupBy(this.widgets, 'type'));
  }


}
