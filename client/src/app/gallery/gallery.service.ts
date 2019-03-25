import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IGallery } from '../model/common/interfaces/gallery.interface';
import { Injectable } from '@angular/core';
import { HeaderService } from '../header/header.service';


@Injectable()
export class GalleryService {
    selected: any;
    selectedImageId = '';

    constructor(public http: HttpClient, private headerService: HeaderService) {}

    getImageTypes(): Observable<any> {
        return this.http.get('/api/imageTypes');
    }

    getImages(sort: string, order: string, page: number, pageSize: number, filters?: string): Observable<IGallery> {
        const params = new HttpParams()
            .set('sort', sort ? 'image.' + sort : 'image.id')
            .set('order', order ? order.toUpperCase() : 'ASC')
            .set('page', page ? page.toString() : '0')
            .set('pageSize', pageSize ? pageSize.toString() : '25')
            .set('filters', filters);

        const req = this.http.get<IGallery>('/api/gallery/', {params: params, observe: 'events', reportProgress: true});
        return this.headerService.display_progress(req, 'Downloading: Gallery');
    }
}
