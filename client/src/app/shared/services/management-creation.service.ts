import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ManagementCreationService {
    private propertyTypes: any[];
    private properties: string[];
    private propertyValues: string[];
    private instantiatedModel: object;

    constructor(private http: HttpClient) { }

    public storePropertyTypes(propertyTypes: any[]): void {
        this.propertyTypes = propertyTypes;
        console.log(this.propertyTypes);
    }

    public storeInstantiatedModel(instantiatedModel: object): void {
        this.instantiatedModel = instantiatedModel;
        console.log(this.instantiatedModel);
    }

    public sendCreationEvent(properties: string[], propertyValues: string[]): string {
        this.properties = properties;
        this.propertyValues = propertyValues;
        // need to check if values are null.
        if (this.checkPropertyValues()) {
            console.log('It worked?');
        }

        return '';
    }

    private checkPropertyValues(): boolean {
        let tempType: any;
        console.log('test');

        for (let index = 0; index < this.propertyValues.length; index++) {
            tempType = this.instantiatedModel[this.propertyTypes[index]];
            if (this.propertyValues[index] as typeof tempType === null) {
                return false;
            } else {
                this.instantiatedModel[this.propertyTypes[index]] = this.propertyValues[index] as typeof tempType;
            }
        }
        return true;
    }

    public createModelFromManagement(model: string) {
        this.http.post<any>(`/api/${model}/create`, {/*Item that was created */});
    }
}
