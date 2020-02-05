import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginService } from './login.service';
import { FacadeService } from './facade.service';
// { nService } ...

@NgModule({
    imports: [
      CommonModule
    ],
    declarations: [],
    providers: [
        LoginService,
        FacadeService
        // nService ...
    ]
  })
  export class FacadeModule { }
