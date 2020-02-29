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

    public sendCreationEvent(properties, propertyValues: string[]): string {
        this.properties = properties;
        this.propertyValues = propertyValues;

        if (this.checkPropertyValues()) {
            console.log('It worked?');
            console.log(this.instantiatedModel);
            this.createModelFromManagement().subscribe();
        }

        return '';
    }

    private checkPropertyValues(): boolean {
        let propertyValue: any;
        console.log('test');

        for (let index = 0; index < this.propertyValues.length; index++) {
            // const testValue: typeof tempType = this.propertyValues[index] as typeof tempType;
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

    public createModelFromManagement(): Observable<any> {
        console.log(`/api/${this.modelName}s/create`);
        return this.http.post<any>(`/api/${this.modelName}s/create`, this.instantiatedModel);
    }

    public setInstantiatedModel(instantiatedModel: object): void {
        this.instantiatedModel = instantiatedModel;
    }

    public setModelName(modelName: string): void {
        this.modelName = modelName;
    }
}
