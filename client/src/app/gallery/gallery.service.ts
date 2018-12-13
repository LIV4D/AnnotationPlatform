import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IGallery } from '../model/common/interfaces/gallery.interface';
import { Injectable } from '@angular/core';


@Injectable()
export class GalleryService {
    selected: any;
    selectedImageId = '';

    getImageTypes(): Observable<any> {
        return this.http.get('/api/imageTypes');
    }


    constructor(public http: HttpClient) {}
    getImages(sort: string, order: string, page: number, pageSize: number, filters?: string): Observable<IGallery> {
        const options = {
            params: new HttpParams()
                .set('sort', sort ? 'image.' + sort : 'image.id')
                .set('order', order ? order.toUpperCase() : 'ASC')
                .set('page', page ? page.toString() : '0')
                .set('pageSize', pageSize ? pageSize.toString() : '25')
                .set('filters', filters)
        };
        const res = this.http.get<IGallery>('/api/gallery/', options);
        return res;
    }
}
