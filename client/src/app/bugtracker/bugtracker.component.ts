import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BugtrackerService } from './bugtracker.service';
import { AppService } from '../app.service';

@Component({
    selector: 'app-bugtracker',
    templateUrl: './bugtracker.component.html',
    styleUrls: ['./bugtracker.component.scss']
})
export class BugtrackerComponent implements OnInit {

    visible = false;
    @ViewChild('bugDescription') bugDescription: ElementRef;

    constructor(public service: BugtrackerService, public appService: AppService) {}

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

    enableOnKeyDown(): void {
        this.appService.keyEventsEnabled = true;
    }

    disableOnKeyDown(): void {
        this.appService.keyEventsEnabled = false;
    }
}
