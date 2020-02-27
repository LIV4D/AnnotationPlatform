import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IGallery } from './gallery.interface';
import { HeaderService } from '../header.service';

@Injectable({
  providedIn: 'root'
})
export class GalleryService {
  selected: any;
  selectedImageId = '';

  constructor(public http: HttpClient, private headerService: HeaderService) {}

  getImageTypes(): Observable<any> {
      return this.http.get('/api/imageTypes');
  }

  getImages(sort: string, order: string, page: number, pageSize: number, filters?: string): Observable<IGallery> {
    console.log('GalleryService::getImages()');

    const params = new HttpParams()
    .set('sort', sort ? 'image.' + sort : 'image.id')
    .set('order', order ? order.toUpperCase() : 'ASC')
    .set('page', page ? page.toString() : '0')
    .set('pageSize', pageSize ? pageSize.toString() : '25')
    .set('filters', filters);

    console.log('params: ' + params);

    const req = this.http.get<IGallery>('/api/gallery/', {params, observe: 'events', reportProgress: true});

    // .subscribe( (res) => {
    //   console.log('response is : ' + res);
    // });

    return this.headerService.display_progress(req, 'Downloading: Gallery');
  }
}
