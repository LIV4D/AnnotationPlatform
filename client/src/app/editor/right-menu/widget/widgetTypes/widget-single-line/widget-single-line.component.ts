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
    public defaultEntryValue: string;
    private regexp: RegExp;
    // @Output() entryField: string;
    constructor() { }

    ngOnInit(): void {
        this.labelText = this.widget.label;
        this.entryField = this.widget.entryField;
        this.defaultEntryValue = this.widget.defaultEntryValue;
        // this.regexp = (!isNullOrUndefined(this.widget.validationRegex) && this.widget.validationRegex !== '' ? null : new RegExp(this.widget.validationRegex));
        // if(!isNullOrUndefined(this.regexp) && this.regexp.test(this.entryField))
    }

}
