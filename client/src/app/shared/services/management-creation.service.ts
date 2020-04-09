import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isNullOrUndefined } from 'util';
import { catchError } from 'rxjs/operators';
import { ErrorMessageService } from './errorMessage.service';

@Injectable({
  providedIn: 'root'
})
export class ManagementCreationService {
    private modelName: string;
    private propertyValues: string[];
    private properties: string[];
    private instantiatedModel: object;

    constructor(private http: HttpClient, private errorMessage: ErrorMessageService) { }

    /**
     * Checks to see if the values are appropriate for they types and sends an event to the server
     * @param properties names of the properties that are in the model
     * @param propertyValues values of the properties that have already been determined
     * @returns string of whether the event was succesful or not
     */
    public sendHttpEvent(eventName: string, properties: string[], propertyValues: string[]): string {
        this.properties = properties;
        this.propertyValues = propertyValues;

        if (this.determineCheck(eventName)) {
            const observable = this.chooseAppropriateObservable(eventName);

            observable.pipe(catchError(x => this.errorMessage.handleServerError(x))).subscribe();

            return 'Event Successfully Sent!';
        }

        return 'Event failed to send! Please check if all fields have correct types.';
    }

    private chooseAppropriateObservable(eventName: string): Observable<any> {
        let observable : Observable<any>;
        switch(eventName) {
            case 'delete':
                observable = this.deleteEvent(this.propertyValues[0]);
                break;
            case 'create':
                observable = this.eventModelFromManagement(eventName);
                break;
            case 'update':
                observable = this.updateEvent(this.propertyValues[0]);
                break;
            default:
                observable = this.eventModelFromManagement(eventName);
        }

        return observable;
    }

    private determineCheck(eventName: string): boolean {
        switch(eventName) {
            case 'delete':
                return this.checkPropertyValues(1);
            case 'create':
                return this.checkPropertyValues(undefined, [0]);
            case 'update':
                return this.checkPropertyValues();
            default:
                return this.checkPropertyValues();
        }
    }

    /**
     * Assigns the different property values to the instantiatedModel if they are appropriate.
     * @param maxIndex is the maximum index to which items must be checked
     * @param skipIndex is an array of indexes that must be skipped
     * @returns true if all values were properperly assigned, false otherwise.
     */
    private checkPropertyValues(maxIndex = this.propertyValues.length, skipIndex: number[] = []): boolean {
        let propertyValue: any;
        for (let index = 0; index < maxIndex; index++) {
            if(skipIndex.indexOf(index) >= -1) {
                continue;
            }
            propertyValue = this.convertToType(this.instantiatedModel[this.properties[index]], this.propertyValues[index]);
            if (isNullOrUndefined(propertyValue) || Number.isNaN(propertyValue)) {
                return false;
            } else {
                this.instantiatedModel[this.properties[index]] = propertyValue;
            }
        }
        return true;
    }

    /**
     * Converts the toBeConverted parameter to the same type as the type parameter.
     */
    private convertToType(type: any, toBeConverted: any) {
        if (toBeConverted === 'false') {
            return false;
        }
        return (type.constructor) (toBeConverted);
    }

    /**
     * Launches a post event to the server with the intended event name.
     * @param event is a post event on the modelName's controller.
     */
    public eventModelFromManagement(event: string): Observable<any> {
        return this.http.post<any>(`/api/${this.modelName}s/${event}`, this.instantiatedModel);
    }

    /**
     * 
     * @param idToDelete an id corresponding to an entity of type modelName.
     */
    public deleteEvent(idToDelete): Observable<any> {
        return this.http.delete<any>(`/api/${this.modelName}s/delete/${idToDelete}`, this.instantiatedModel);
    }

    public updateEvent(idToUpdate): Observable<any> {
        return this.http.put<any>(`/api/${this.modelName}s/update/${idToUpdate}`, this.instantiatedModel);
    }

    public setInstantiatedModel(instantiatedModel: object): void {
        this.instantiatedModel = instantiatedModel;
    }

    public setModelName(modelName: string): void {
        this.modelName = modelName;
    }
}
