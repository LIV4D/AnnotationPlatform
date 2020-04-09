import { Component, OnInit, Input, Output } from '@angular/core';
import { Widget } from 'src/app/shared/models/serverModels/widget.model';

@Component({
  selector: 'app-widget-single-line',
  templateUrl: './widget-single-line.component.html',
  styleUrls: ['./widget-single-line.component.scss']
})
export class WidgetSingleLineComponent implements OnInit {
    @Input() widget: Widget;
    public labelText: string;
    public entryField: string;
    // @Output() entryField: string;
    constructor() { }

    ngOnInit(): void {
        this.labelText = this.widget.label;
        this.entryField = this.widget.entryField;
    }

}
