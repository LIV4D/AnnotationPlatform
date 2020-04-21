import { Injectable } from '@angular/core';
import { Widget } from 'src/app/shared/models/serverModels/widget.model';
import { WidgetStorageService } from 'src/app/shared/services/editor/data-persistence/widgetStorage.service';
import { Observable } from 'rxjs';
import { WidgetEventService } from 'src/app/shared/services/editor/widgetEvent.service';

@Injectable({
  providedIn: 'root'
})
export class WidgetFacadeService {


    constructor(private widgetStorage: WidgetStorageService, private widgetEvent: WidgetEventService) { }

    /**
     * Get all wdigets for annotation
     */
    public getWidgets() : Observable<Widget[]> {
        return this.widgetStorage.getWidgets();
    }

    public saveEntry(newEntryValue: string, widgetId: number) {
        return this.widgetEvent.saveEntry(newEntryValue, widgetId);
    }

}
