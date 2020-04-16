import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { AppService } from '../shared/services/app.service';
import { BugtrackerFacadeService } from './bugtracker.facade.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-bugtracker',
  templateUrl: './bugtracker.component.html',
  styleUrls: ['./bugtracker.component.scss']
})
export class BugtrackerComponent {

  constructor(
    public facadeService: BugtrackerFacadeService, public appService: AppService,
    public dialogRef: MatDialogRef<BugtrackerComponent>) {}

  /**
   * Close bugtracker dialog
   */
  onNoClick(): void {
    this.dialogRef.close();
  }

  /**
   * Send bug description entered by user in bugtracker dialog textbox
   * @param description: bug description entered by user in bugtracker dialog textbox
   */
  send(description: string): void {
      if (description === '') {
          return;
      }
      this.facadeService.send(description);
      this.onNoClick();
  }

  /**
   * Cancel bugtracker dialog
   */
  cancel(): void {
      this.onNoClick();
  }

  enableOnKeyDown(): void {
      this.appService.keyEventsEnabled = true;
  }

  disableOnKeyDown(): void {
      this.appService.keyEventsEnabled = false;
  }
}
