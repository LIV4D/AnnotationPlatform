import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbar } from '@angular/material/toolbar';
import { LayoutModule } from '@angular/cdk/layout';
import { NgModule } from '@angular/core';



@NgModule({

    exports: [
        MatTooltipModule,
        MatIconModule,
        LayoutModule,
        MatToolbar
    ]
})

export class MaterialModule { }
