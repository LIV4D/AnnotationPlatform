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
      return this.http.get('/api/imageTypes/');
  }
  // getTweakedImageTypes(): Observable<any> {
  //     return this.http.get('/api/images/gallery');
  // }

  getImages(sort: string, order: string, page: number, pageSize: number, filters?: string): Observable<IGallery> {
    console.log('GalleryService::getImages()');

    const params = new HttpParams()
    .set('sort', sort ? 'image.' + sort : 'image.id')
    .set('order', order ? order.toUpperCase() : 'ASC')
    .set('page', page ? page.toString() : '0')
    .set('pageSize', pageSize ? pageSize.toString() : '25')
    .set('filters', filters);

    // TODO: It was like that but /api/gallery/ couldn't resolve to a valid path -- Check this out with partners
    // const req = this.http.get<IGallery>('/api/gallery/', {params, observe: 'events', reportProgress: true});
    const req = this.http.get<IGallery>('/api/images/gallery/', {params, observe: 'events', reportProgress: true});

    return this.headerService.display_progress(req, 'Downloading: Gallery');
  }
}
