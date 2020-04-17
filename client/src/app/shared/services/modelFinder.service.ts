import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorMessageService } from './errorMessage.service';

@Injectable({
  providedIn: 'root'
})
export class ModelFinderService {

    constructor(private http: HttpClient, private errorMessage: ErrorMessageService) { }
    /**
     * Gets the attributes and instantiates the stated model.
     * @param model a name of a model/interface within the common folder
     * @returns Returns an array containing the propertyNames (string[]) and the instantiatedModel (object)
     */
    public async getAttributesOf(model: string): Promise<Map<string, string[] | object>> {
        // Put the name to lowercase for the first letter just in case then capitalize in order to have the appropriate class name.
        model = model.charAt(0).toLowerCase() + model.slice(1);
        const modelCapitalized = model.charAt(0).toUpperCase() + model.slice(1);
        // The naming convention for the models is minimized first letter then model. For example, task.model.
        const modelPath = `${model}.model`;
        const returnValue: Map<string, string[] | object> = new Map();

        try {
            // Dynamic import. If the models folder gets too large, consider moving this.
            const modelImport = await import(`../models/serverModels/${modelPath}`);

            const instantiatedModel = new (modelImport as any)[modelCapitalized]();
            returnValue.set('propertyNames', Object.getOwnPropertyNames(instantiatedModel));
            returnValue.set('instantiatedModel', instantiatedModel);
            returnValue.set('propertyTypes', this.getAllPropertyTypes(instantiatedModel))

        } catch (error) {
            console.error('There was a problem while retrieving the requested model : ' + error);
            returnValue.set('propertyNames', ['error']);
            returnValue.set('instantiatedModel', null);
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

    public async getModelNames(): Promise<string[]> {
        return await this.getModelNamesCall().pipe(catchError(x => this.errorMessage.handleServerError(x))).toPromise();
    }

    private getModelNamesCall(): Observable<string[]> {
        return this.http.get<string[]>('/api/management/listNames');
    }
}
