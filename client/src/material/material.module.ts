import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { LayoutModule } from '@angular/cdk/layout';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSidenavModule } from '@angular/material/sidenav';
import {MatSliderModule} from '@angular/material/slider';
import { MatDialogModule } from '@angular/material/dialog';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
// import { MatToolbarMixinBase } from '@angular/material/toolbar';
import { MatTreeModule } from '@angular/material/tree';
import {MatSortModule} from '@angular/material/sort';
// import { MatToolbar } from '../material/material.module';
// import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';

import { DragDropModule } from '@angular/cdk/drag-drop';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
    imports: [
      BrowserModule,
      MatDialogModule,
      MatTreeModule,
      MatTooltipModule,
      MatIconModule,
      LayoutModule,
      MatToolbarModule,
      MatExpansionModule,
      MatTableModule,
      MatCheckboxModule,
      MatPaginatorModule,
      MatSortModule,
      MatSidenavModule,
      MatSliderModule,
      MatTabsModule,
      MatListModule,

      MatCardModule,
      DragDropModule,
      MatInputModule,
      MatFormFieldModule,
      MatButtonModule
    ],
    exports: [
        BrowserModule,
        MatDialogModule,
        MatTreeModule,
        MatTooltipModule,
        MatIconModule,
        LayoutModule,
        MatExpansionModule,
        MatToolbarModule,
        MatTableModule,
        MatCheckboxModule,
        MatPaginatorModule,
        MatSortModule,
        MatSidenavModule,
        MatSliderModule,
        MatToolbarModule,
        MatTabsModule,
        MatFormFieldModule,
        MatInputModule,
        DragDropModule,
        MatButtonModule,
        MatListModule,
        MatCardModule
    ]
})

export class MaterialModule {}
