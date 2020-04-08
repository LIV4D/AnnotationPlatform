import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
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

    constructor(public dialogRef: MatDialogRef<ErrorComponent>) { }

    ngOnInit(): void {
    }

}
