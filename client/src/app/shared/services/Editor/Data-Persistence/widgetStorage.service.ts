import { Widget } from './../../../models/serverModels/widget.model';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
  })
  export class WidgetStorageService {

    private widgets: BehaviorSubject<Widget[]> = new BehaviorSubject<Widget[]>([]);

    constructor() {
    }

    public setWidgets(widgets: Widget[]): void{
        this.widgets.next(widgets);
    }
    
    public getWidgets(): Observable<Widget[]> {
        return this.widgets.asObservable()
    }    
  }