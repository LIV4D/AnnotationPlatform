import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Widget } from 'src/app/shared/models/serverModels/widget.model';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-widget-single-line',
  templateUrl: './widget-single-line.component.html',
  styleUrls: ['./widget-single-line.component.scss']
})
export class WidgetSingleLineComponent implements OnInit {
    @Input() widget: Widget;
    public labelText: string;
    public entryField: string;
    public defaultEntryValue: string;
    public validRegex = '';
    private regexp: RegExp;
    // @Output() entryField: string;
    @Output() saveEntryEvent = new EventEmitter<Widget>();

    constructor() { }

    ngOnInit(): void {
        this.labelText = this.widget.label;
        this.entryField = this.widget.entryField;
        this.defaultEntryValue = this.widget.defaultEntryValue;
    }

    sendValue() {
        if(!isNullOrUndefined(this.widget.validationRegex) && this.widget.validationRegex !== '') {
            if (this.entryField.match(this.widget.validationRegex)) {
                this.widget.entryField = this.entryField;
                this.saveEntryEvent.emit(this.widget);
                this.validRegex = 'Your entry was sent!';
            } else {
                this.validRegex = 'Your entry was not sent due to invalid regex match.';
            }
        } else {
            this.widget.entryField = this.entryField;
            this.saveEntryEvent.emit(this.widget);
            this.validRegex = 'Your entry was sent!';
        }
    }

}
