import { NgModule } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LayoutModule } from '@angular/cdk/layout';



@NgModule({

    exports: [
        MatTooltipModule,
        LayoutModule
    ]
})

export class MaterialModule { }
