import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Widget } from 'src/app/shared/models/serverModels/widget.model';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-widget-multiple-lines',
  templateUrl: './widget-multiple-lines.component.html',
  styleUrls: ['./widget-multiple-lines.component.scss']
})
export class WidgetMultipleLinesComponent implements OnInit {
    @Input() widget: Widget;
    public labelText: string;
    public entryField: string;
    public defaultEntryValue: string;
    private regexp: RegExp;
    // @Output() entryField: string;
    @Output() saveEntryEvent = new EventEmitter<Widget>();

    constructor() { }

    ngOnInit(): void {
        this.labelText = this.widget.label;
        this.entryField = this.widget.entryField;
        this.defaultEntryValue = this.widget.defaultEntryValue;
        this.regexp = (!isNullOrUndefined(this.widget.validationRegex) && this.widget.validationRegex !== '' ? null : new RegExp(this.widget.validationRegex));
    }

    sendValue() {
        // if(!isNullOrUndefined(this.regexp) && this.regexp.test(this.entryField)){
            this.widget.entryField = this.entryField;
            this.saveEntryEvent.emit(this.widget);
        // }
    }

}
