import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IGallery } from './gallery.interface';

@Injectable({
  providedIn: 'root'
})
export class GalleryService {
  selected: any;
  selectedImageId = '';

  // constructor(public http: HttpClient, private headerService: HeaderService) {}
  constructor(public http: HttpClient) {}

  getImageTypes(): Observable<any> {
      return this.http.get('/api/imageTypes');
  }

  // getImages(sort: string, order: string, page: number, pageSize: number, filters?: string): Observable<IGallery> {
  getImages(sort: string, order: string, page: number, pageSize: number, filters?: string) {
      const params = new HttpParams()
          .set('sort', sort ? 'image.' + sort : 'image.id')
          .set('order', order ? order.toUpperCase() : 'ASC')
          .set('page', page ? page.toString() : '0')
          .set('pageSize', pageSize ? pageSize.toString() : '25')
          .set('filters', filters);

      const req = this.http.get<IGallery>('/api/gallery/', {params: params, observe: 'events', reportProgress: true});
      // return this.headerService.display_progress(req, 'Downloading: Gallery');
  }
}
