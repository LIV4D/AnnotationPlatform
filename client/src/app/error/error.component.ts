import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ErrorSeverity } from 'src/app/shared/services/errorMessage.service';
import { ErrorFacadeService } from './error.facade.service';

@Component({
  selector: 'app-error-component',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})

export class ErrorComponent implements OnInit {

    visible = false;
    errorDescription = '';
    severity: ErrorSeverity;

    constructor(public dialogRef: MatDialogRef<ErrorComponent>,
            @Inject(MAT_DIALOG_DATA) public data: any,
            private facadeService: ErrorFacadeService) {
        this.errorDescription = data.errorDescription;
        this.severity = data.severity;
     }

    ngOnInit(): void {
        switch(this.severity){
            case ErrorSeverity.benign:
                break;
            case ErrorSeverity.noticeable:
                break;
            case ErrorSeverity.critical:
                this.facadeService.logout();
                break;
        }
    }

}
