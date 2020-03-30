import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { Component } from '@angular/core';

@Component({
    selector: 'app-biomarkers-dialog',
    templateUrl: './biomarkers-dialog.component.html',
    styleUrls: ['./biomarkers-dialog.component.scss']
})
export class BiomarkersDialogComponent {

    constructor(
        // l'erreur ici est normale, mismatch version typescript et angular material?
        public dialogRef: MatDialogRef<BiomarkersDialogComponent>) {
         }

    onNoClick(): void {
        this.dialogRef.close();
    }

}
