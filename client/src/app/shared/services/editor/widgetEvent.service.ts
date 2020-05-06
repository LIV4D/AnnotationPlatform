import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorMessageService } from '../error-message.service';

@Injectable({
  providedIn: 'root'
})

// Service providing usefull function
// helping with the Widget Events
export class WidgetEventService {

    constructor(private http: HttpClient, private errorMessage: ErrorMessageService) { }

    public async saveEntry(newEntryValue: string, widgetId: number): Promise<void> {
        await this.saveEvent(newEntryValue, widgetId).pipe(catchError(x => this.errorMessage.handleServerError(x))).toPromise();
    }

    private saveEvent(newEntryValue: string, widgetId: number): Observable<Object>{

        return this.http.put(`/api/widgets/update/${widgetId}`, {entryField: newEntryValue});
    }
}
