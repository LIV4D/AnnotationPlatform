import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { AppService } from '../shared/services/app.service';
import { BugtrackerFacadeService } from './bugtracker.facade.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface DialogData {}

@Component({
  selector: 'app-bugtracker',
  templateUrl: './bugtracker.component.html',
  styleUrls: ['./bugtracker.component.scss']
})
export class BugtrackerComponent implements OnInit {

  visible = false;
  @ViewChild('bugDescription') bugDescription: ElementRef;

  constructor(
    public facadeService: BugtrackerFacadeService, public appService: AppService,
    public dialogRef: MatDialogRef<BugtrackerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
  }

  get bug(): string {
      return this.bugDescription.nativeElement.value;
  }

  send(): void {
      if (!this.bug) {
          return;
      }

      this.facadeService.send(this.bug);
      this.bugDescription.nativeElement.value = '';
      // this.facadeService.hide();
  }

  cancel(): void {
      this.bugDescription.nativeElement.value = '';
      // this.facadeService.hide();
  }

  enableOnKeyDown(): void {
      this.appService.keyEventsEnabled = true;
  }

  disableOnKeyDown(): void {
      this.appService.keyEventsEnabled = false;
  }
}
