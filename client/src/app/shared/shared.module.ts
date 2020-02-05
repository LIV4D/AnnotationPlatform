import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FacadeModule } from './services/facade.module';

@NgModule({
  imports: [
    CommonModule,
    FacadeModule
  ],
  declarations: []
})
export class SharedModule { }
