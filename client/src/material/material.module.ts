// import { MaterialModule } from '@angular/material.module';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { LayoutModule } from '@angular/cdk/layout';
import { NgModule } from '@angular/core';
import { AppComponent } from './../app/app.component';
import { BrowserModule } from '@angular/platform-browser';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatSliderModule} from '@angular/material/slider';

// import { MatToolbarMixinBase } from '@angular/material/toolbar';
import { MatTreeModule } from '@angular/material/tree';
// import { MatToolbar } from '../material/material.module';
// import { MatIconModule } from '@angular/material/icon';

@NgModule({
    imports: [
        // AppComponent,
        BrowserModule,
        MatTreeModule,
        MatTooltipModule,
        MatIconModule,
        LayoutModule,
        MatToolbarModule,
        MatCheckboxModule,
        MatSliderModule
    ],
    exports: [
        // AppComponent,
        BrowserModule,
        MatTreeModule,
        MatTooltipModule,
        MatIconModule,
        LayoutModule,
        MatToolbarModule,
        MatCheckboxModule,
        MatSliderModule
    ]
})

export class MaterialModule {}
