
import { MatTooltipModule } from '@angular/material/tooltip';
import { LayoutModule } from '@angular/cdk/layout';
import { NgModule } from '@angular/core';

@NgModule({

    exports: [
        MatTooltipModule,
        LayoutModule,
    ]
})

export class MaterialModule { }
