import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ErrorFacadeService } from './error-popup.facade.service';

@Component({
  selector: 'app-error-component',
  templateUrl: './error-popup.component.html',
  styleUrls: ['./error-popup.component.scss']
})

export class ErrorComponent implements OnInit {

    visible = false;
    errorDescription = '';

    constructor(public dialogRef: MatDialogRef<ErrorComponent>,
            @Inject(MAT_DIALOG_DATA) public data: any,
            private facadeService: ErrorFacadeService) {
        this.errorDescription = data.errorDescription;
     }

    ngOnInit(): void {
        switch(this.data.severity){
            case 0:
                break;
            case 1:
                break;
            case 2:
                this.logout();
                break;
        }
    }

    logout() {
        this.facadeService.logout();
    }

    close(): void {
        this.dialogRef.close();
    }

}
