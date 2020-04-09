import { WidgetMultipleLinesComponent } from './widgetTypes/widget-multiple-lines/widget-multiple-lines.component';
import { WidgetSingleLineComponent } from './widgetTypes/widget-single-line/widget-single-line.component';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { WidgetFacadeService } from './widget.facade.service';
import { Task } from 'src/app/shared/models/serverModels/task.model';
import { Widget } from 'src/app/shared/models/serverModels/widget.model';
import * as _ from 'underscore';
import { isNullOrUndefined } from 'util';

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
  public singleLineWidgets: Widget[];
  public multiLineWidgets: Widget[];

  constructor(private facadeService: WidgetFacadeService) { }

    ngOnInit(): void {
        this.facadeService.getWidgets().subscribe(widgets =>{
            this.widgets = widgets;
            console.log(this.widgets);
            this.initWidgets();
        })
    }

    public initWidgets(): void {
        if (!isNullOrUndefined(this.widgets) && this.widgets.length > 0) {
            const sortedWidgets = _.groupBy(this.widgets, 'type');
            this.singleLineWidgets = sortedWidgets['singleLine'];
            this.multiLineWidgets = sortedWidgets['multiLine'];
        }
    }

    ngAfterViewInit(): void {
        this.initWidgets();
    }
}
