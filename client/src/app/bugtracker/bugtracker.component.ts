import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BugtrackerService } from './bugtracker.service';

@Component({
    selector: 'app-bugtracker',
    templateUrl: './bugtracker.component.html',
    styleUrls: ['./bugtracker.component.scss']
})
export class BugtrackerComponent implements OnInit {

    visible = false;
    @ViewChild('bugDescription') bugDescription: ElementRef;

    constructor(public service: BugtrackerService) {}

    ngOnInit(): void {
    }

    get bug(): string {
        return this.bugDescription.nativeElement.value;
    }

    send(): void {
        if (!this.bug) {
            return;
        }

        this.service.send(this.bug);
        this.bugDescription.nativeElement.value = '';
        this.service.hide();
    }

    cancel(): void {
        this.bugDescription.nativeElement.value = '';
        this.service.hide();
    }
}
