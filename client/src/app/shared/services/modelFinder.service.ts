import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModelFinderService {

    constructor() { }
    public async getAttributesOf(model: string): Promise<Map<string, string[]>> {
        model = model.charAt(0).toLowerCase() + model.slice(1);
        const modelPath = `${model}.model`;
        const modelCapitalized = model.charAt(0).toUpperCase() + model.slice(1);
        const returnValue: Map<string, string[]> = new Map();

        try {
            const modelImport = await import(`../models/${modelPath}`);

            const instantiatedModel = new (modelImport as any)[modelCapitalized]();
            returnValue.set('propertyNames', Object.getOwnPropertyNames(instantiatedModel));
            returnValue.set('propertyTypes', this.getAllPropertyTypes(instantiatedModel));

        } catch (error) {
            console.error('There was a problem while retrieving the requested model : ' + error);
            returnValue.set('propertyNames', ['error']);
            returnValue.set('propertyTypes', ['error']);
        }
        return returnValue;
    }

    public getAllPropertyTypes(object: any): Array<any> {
        const propertyTypes = new Array();
        Object.getOwnPropertyNames(object).forEach(propertyName => {
            propertyTypes.push(this.getPropertyType(object, propertyName));
        });
        return propertyTypes;
    }

    public getPropertyType(object: any, name: any) {
        return typeof object[name];
    }
}
