import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AppService } from '../shared/services/app.service';
import { BugtrackerFacadeService } from './bugtracker.facade.service';

@Component({
  selector: 'app-bugtracker',
  templateUrl: './bugtracker.component.html',
  styleUrls: ['./bugtracker.component.scss']
})
export class BugtrackerComponent implements OnInit {

  visible = false;
  @ViewChild('bugDescription') bugDescription: ElementRef;

  constructor(public facadeService: BugtrackerFacadeService, public appService: AppService) {}

  ngOnInit(): void {
  }

  get bug(): string {
      return this.bugDescription.nativeElement.value;
  }

  getIsVisible(): boolean {
    return this.facadeService.getIsVisible();
  }

  send(): void {
      if (!this.bug) {
          return;
      }

      this.facadeService.send(this.bug);
      this.bugDescription.nativeElement.value = '';
      this.facadeService.hide();
  }

  cancel(): void {
      this.bugDescription.nativeElement.value = '';
      this.facadeService.hide();
  }

  enableOnKeyDown(): void {
      this.appService.keyEventsEnabled = true;
  }

  disableOnKeyDown(): void {
      this.appService.keyEventsEnabled = false;
  }
}
