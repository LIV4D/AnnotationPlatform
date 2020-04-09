import { Widget } from './../../../models/serverModels/widget.model';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
  })
  export class widgetStorageService {

    private widgets: Widget[] = [];

    constructor() {
    }

    public setWidgets(widgets: Widget[]){
        this.widgets = widgets;
    }
    
  }