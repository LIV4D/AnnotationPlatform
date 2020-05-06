import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ErrorComponent } from 'src/app/error/error.component';
import { isNullOrUndefined } from 'util';

export enum ErrorSeverity {
    benign = 0,
    noticeable = 1,
    critical = 2,
}
@Injectable({
    providedIn: 'root'
})

export class ErrorMessageService {

    constructor(public errorDialog: MatDialog) { }

    public handleServerError(err: HttpErrorResponse, severity?: ErrorSeverity): Observable<any> {
        if (isNullOrUndefined(severity)) {
            // https://www.restapitutorial.com/httpstatuscodes.html
            switch(err.status) {
                case 200:
                case 204:
                    return;
                case 304:
                    severity = ErrorSeverity.benign;
                    break;
                case 403:
                    severity = ErrorSeverity.critical;
                    break;
                case 401:
                case 404:
                case 409:
                case 500:
                default:
                    severity = ErrorSeverity.noticeable;
            }
        }

        this.errorDialog.open(ErrorComponent, {
            hasBackdrop: false,
            data: {
                severity,
                errorDescription: err.message,
            }
        });

        // Not sure what observable to return. Temporary
        return of(err.message);
    }

    public handleStorageError(error: Error, severity = ErrorSeverity.noticeable) {
        this.errorDialog.open(ErrorComponent, {
            hasBackdrop: false,
            data: {
                severity,
                errorDescription: error.message,
            }
        });
    }
}
