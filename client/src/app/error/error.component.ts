import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ErrorFacadeService } from './error.facade.service';

@Component({
  selector: 'app-error-component',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})

export class ErrorComponent implements OnInit {

    visible = false;
    errorDescription = '';

    constructor(public dialogRef: MatDialogRef<ErrorComponent>,
            @Inject(MAT_DIALOG_DATA) public data: any,
            private facadeService: ErrorFacadeService) {
        this.errorDescription = data.errorDescription;
        // data.severity;
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
        this.dialogRef.close();
    }

    close(): void {
        this.dialogRef.close();
    }

}
