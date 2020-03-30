import { WidgetMultipleLinesComponent } from './widgetTypes/widget-multiple-lines/widget-multiple-lines.component';
import { WidgetSingleLineComponent } from './widgetTypes/widget-single-line/widget-single-line.component';
import { Component, OnInit } from '@angular/core';
import { WidgetFacadeService } from './widget.facade.service';
import { Task } from 'src/app/shared/models/serverModels/task.model';

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

  constructor(private facadeService: WidgetFacadeService) { }

  ngOnInit(): void {
      this.task = this.facadeService.getCurrentTask();
  }



}
