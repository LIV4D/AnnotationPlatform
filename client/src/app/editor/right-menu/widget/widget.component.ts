import { WidgetMultipleLinesComponent } from './widgetTypes/widget-multiple-lines/widget-multiple-lines.component';
import { WidgetSingleLineComponent } from './widgetTypes/widget-single-line/widget-single-line.component';
import { Component, OnInit } from '@angular/core';
import { WidgetFacadeService } from './widget.facade.service';
import { Task } from 'src/app/shared/models/serverModels/task.model';
import { Widget } from 'src/app/shared/models/serverModels/widget.model';

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
  private task : Task;
  private widgets: Widget[];

  constructor(private facadeService: WidgetFacadeService) { }

  ngOnInit(): void {
      this.task = this.facadeService.getCurrentTask();
      this.widgets = this.task.widgets;
  }


}
