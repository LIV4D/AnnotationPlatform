import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Widget } from 'src/app/shared/models/serverModels/widget.model';

@Component({
  selector: 'app-widget-single-line',
  templateUrl: './widget-single-line.component.html',
  styleUrls: ['./widget-single-line.component.scss']
})
export class WidgetSingleLineComponent implements OnInit {
    @Input() widget: Widget;
    public labelText: string;
    entryField: string;
    @Output() newItemEvent = new EventEmitter<string>();

    constructor() { }

    ngOnInit(): void {
        this.labelText = this.widget.label;
        this.entryField = this.widget.entryField;
    }

    sendValue() {
      this.newItemEvent.emit(this.entryField);
    }

}
