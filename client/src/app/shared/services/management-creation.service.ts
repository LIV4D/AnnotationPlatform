import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ManagementCreationService {

    constructor(private http: HttpClient) { }

    public createModelFromManagement(model: string) {
        this.http.post<any>(`/api/${model}/create`, {/*Item that was created */});
    }
}
