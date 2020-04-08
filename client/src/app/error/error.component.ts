import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ErrorSeverity } from 'src/app/shared/services/errorMessage.service';

@Component({
  selector: 'app-error-component',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})

export class ErrorComponent implements OnInit {

    visible = false;
    errorDescription = '';
    severity: ErrorSeverity;

    constructor(public dialogRef: MatDialogRef<ErrorComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
        this.errorDescription = data.errorDescription;
        this.severity = data.severity;
     }

    ngOnInit(): void {
    }

}
