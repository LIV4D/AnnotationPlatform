import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { AppService } from '../shared/services/app.service';
import { BugtrackerFacadeService } from './bugtracker.facade.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-bugtracker',
  templateUrl: './bugtracker.component.html',
  styleUrls: ['./bugtracker.component.scss']
})
export class BugtrackerComponent implements OnInit {

  visible = false;
  bugDescription = '';

  constructor(
    public facadeService: BugtrackerFacadeService, public appService: AppService,
    public dialogRef: MatDialogRef<BugtrackerComponent>) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
  }

  send(description: string): void {
      if (description === '') {
          return;
      }
      this.bugDescription = description;
      this.facadeService.send(this.bugDescription);
      this.bugDescription = '';
      this.onNoClick();
  }

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
