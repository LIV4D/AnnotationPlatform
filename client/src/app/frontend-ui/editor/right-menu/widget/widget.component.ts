import { Component, OnInit, AfterViewInit } from '@angular/core';
import { WidgetFacadeService } from './widget.facade.service';
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
  entryField = '';
  private widgets: Widget[];
  public singleLineWidgets: Widget[];
  public multiLineWidgets: Widget[];

  constructor(private facadeService: WidgetFacadeService) { }

  /**
   * get widgets all widgets for annotation
   */
    ngOnInit(): void {
        this.facadeService.getWidgets().subscribe(widgets =>{
            this.widgets = widgets;
            this.initWidgets();
        })
    }

    /**
     * Sort all widgets by type
     */
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

    async saveEntry(widgetToUpdate: Widget) {
        await this.facadeService.saveEntry(widgetToUpdate.entryField, widgetToUpdate.id);
    }
}