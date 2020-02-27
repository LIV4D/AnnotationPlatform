import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ManagementCreationService {

    private propertyTypes: any[];
    constructor(private http: HttpClient) { }

    public storePropertyTypes(propertyTypes: any[]) {
        this.propertyTypes = propertyTypes;
        console.log(this.propertyTypes);
    }

    public createModelFromManagement(model: string) {
        this.http.post<any>(`/api/${model}/create`, {/*Item that was created */});
    }
}
