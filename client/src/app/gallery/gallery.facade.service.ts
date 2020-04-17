import { Injectable } from '@angular/core';
import { GalleryService } from '../shared/services/Gallery/gallery.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

@Injectable({
  providedIn: 'root'
})
export class GalleryFacadeService {

  constructor(private galleryService: GalleryService) { }

  public getImages(sort: MatSort, paginator: MatPaginator, pageSize: number, filters: string) {

    return this.galleryService.getImages(sort.active, sort.direction, paginator.pageIndex, pageSize, filters);
  }

  getImageTypes() {
    return this.galleryService.getImageTypes();
  }

  set selected(res) {
    this.galleryService.selected = res;
  }
}
