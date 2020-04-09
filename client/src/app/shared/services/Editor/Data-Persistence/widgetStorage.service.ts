import { Widget } from 'src/app/shared/models/serverModels/widget.model';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
  })
  export class widgetStorageService {
  
    constructor(private widgets: Widget[]) {

    }

  }
}