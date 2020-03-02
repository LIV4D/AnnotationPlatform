import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isNullOrUndefined } from 'util';

@Injectable({
  providedIn: 'root'
})
export class ManagementCreationService {
    private modelName: string;
    private propertyValues: string[];
    private properties: string[];
    private instantiatedModel: object;

    constructor(private http: HttpClient) { }

    /**
     * Checks to see if the values are appropriate for they types and sends an event to the server
     * @param properties names of the properties that are in the model
     * @param propertyValues values of the properties that have already been determined
     * @returns string of whether the event was succesful or not
     */
    public sendCreationEvent(properties: string[], propertyValues: string[]): string {
        this.properties = properties;
        this.propertyValues = propertyValues;

        if (this.checkPropertyValues()) {
            this.eventModelFromManagement('create').subscribe();

            return 'Event Success!';
        }

        return 'Event Failure!';
    }

    /**
     * Assigns the different property values to the instantiatedModel if they are appropriate.
     * @returns true if all values were properperly assigned, false otherwise.
     */
    private checkPropertyValues(): boolean {
        let propertyValue: any;

        for (let index = 0; index < this.propertyValues.length; index++) {
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
     * Creates the appropriate model.
     */
    public eventModelFromManagement(event: string): Observable<any> {
        return this.http.post<any>(`/api/${this.modelName}s/${event}`, this.instantiatedModel);
    }

    public setInstantiatedModel(instantiatedModel: object): void {
        this.instantiatedModel = instantiatedModel;
    }

    public setModelName(modelName: string): void {
        this.modelName = modelName;
    }
}
