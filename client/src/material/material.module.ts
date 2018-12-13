import {
    MatTreeModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatTableModule,
    MatSliderModule,
    MatPaginatorModule,
    MatSortModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatExpansionPanel,
    MatFormFieldModule,
    MatInputModule,
} from '@angular/material/';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LayoutModule } from '@angular/cdk/layout';
import { NgModule } from '@angular/core';

@NgModule({
    exports: [
        MatTreeModule,
        MatToolbarModule,
        MatButtonModule,
        MatSidenavModule,
        MatIconModule,
        MatListModule,
        MatMenuModule,
        MatDialogModule,
        MatDividerModule,
        MatExpansionModule,
        MatTableModule,
        MatSliderModule,
        MatTooltipModule,
        LayoutModule,
        MatPaginatorModule,
        MatSortModule,
        MatSlideToggleModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule
    ]
})

export class MaterialModule { }
