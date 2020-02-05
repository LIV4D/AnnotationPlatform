import { NgModule } from '@angular/core';

import { LoginService } from './login.service';
import { FacadeService } from './facade.service';
// { nService } ...

@NgModule({
    imports: [
    ],
    declarations: [],
    providers: [
        LoginService,
        FacadeService
        // nService ...
    ]
  })
  export class FacadeModule { }
