import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { AppService } from '../shared/services/app.service';
import { Router } from '@angular/router';
import { merge } from 'rxjs';
import { of as observableOf } from 'rxjs';
import { startWith, switchMap, catchError } from 'rxjs/operators';
import { IGallery } from '../shared/services/Gallery/gallery.interface';
import { LocalStorage } from './../shared/services/Editor/local-storage.service';
import { MatTableDataSource } from '@angular/material/table';
import { GalleryFacadeService } from './gallery.facade.service';
import { EditorFacadeService } from '../editor/editor.facade.service';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit, AfterViewInit {

  displayedColumns = ['src', 'id', 'imageType', 'eye', 'hospital', 'patient', 'visit', 'code'];
  showPagination: boolean;
  length: number;
  pageSize: number;
  imageTypes: any[] = [];
  data: any = [];

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('imageTypeField') imageTypeField: ElementRef;
  @ViewChild('eyeSideField') eyeSideField: ElementRef;
  @ViewChild('hospitalField') hospitalField: ElementRef;
  @ViewChild('patientField') patientField: ElementRef;
  @ViewChild('visitField') visitField: ElementRef;
  @ViewChild('codeField') codeField: ElementRef;

  constructor(public appService: AppService, public router: Router, public galleryFacadeService: GalleryFacadeService,
              public editorFacadeService: EditorFacadeService) {
    this.showPagination = true;
    // this.length = 0;
    this.pageSize = 15;

    this.editorFacadeService.imageLoaded = false;
  }

  ngOnInit(): void {
    this.data = new MatTableDataSource();
  }

  ngAfterViewInit(): void {
    this.editorFacadeService.imageServer = null;
    this.editorFacadeService.imageLocal = null;
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    this.getImages();
  }

  getImages(): void {

    // Create filters
    // WARNING : key must correspond to valid column in model
    const filtersObj = {
      'imageType.name': this.imageTypeField.nativeElement.value,
      eye: this.eyeSideField.nativeElement.value,
      hospital: this.hospitalField.nativeElement.value,
      patient: this.patientField.nativeElement.value,
      visit : this.visitField.nativeElement.value,
      code: this.codeField.nativeElement.value
    };
    const filters = JSON.stringify(filtersObj);

    merge(this.sort.sortChange, this.paginator.page)
    .pipe(
      startWith({}),
      switchMap(
        () => {
          // console.log('%c here? ', 'color: red; background: yellow;');

          setTimeout(() => this.appService.loading = true);

          // console.log(
          //   'this.sort.active : ' + this.sort.active
          //   + '\nthis.sort.direction : ' +  this.sort.direction
          //   + '\nthis.paginator.pageIndex : ' + this.paginator.pageIndex
          //   + '\nthis.pageSize : ' + this.pageSize
          //   + '\nfilters : ' + filters
          // );

          // tslint:disable-next-line: max-line-length
          // return this.galleryService.getImages(this.sort.active, this.sort.direction, this.paginator.pageIndex, this.pageSize, filters);
          // tslint:disable-next-line: max-line-length
          return this.galleryFacadeService.getImages(this.sort, this.paginator, this.pageSize, filters);
      }),
      catchError(() => {
        console.log('there is an Error');
        setTimeout(() => this.appService.loading = false);
        return observableOf([]);
      })
    ).subscribe((data: IGallery) => {

      this.pageSize = 15;
      this.length = data.objectCount;
      this.data = data.objects;

      setTimeout(() => this.appService.loading = false, 50000);
    });
  }

  onLocalImageLoaded(event: any): void {
    // console.log('GalleryComponent::onLocalImageLoaded()');

    const reader: FileReader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        this.appService.localEditing = true;
        this.editorFacadeService.imageLocal = image;
        this.editorFacadeService.imageId = 'local';
        LocalStorage.clear();
        this.router.navigate(['/' + 'editor']);
      };
      image.src = reader.result as string;
    };

    reader.readAsDataURL(event.target.files[0]);
  }

  // Retrieves the image types from the server
  getImageTypes(): void {
    this.galleryFacadeService.getImageTypes().subscribe(res => {
      this.galleryFacadeService.selected = res[0];
      this.imageTypes = res;
    });
  }

  loadImage(imageId: string): void {
    // console.log('GalleryComponent::loadImage()');

    this.appService.localEditing = false;
    localStorage.setItem('previousPage', 'gallery');
    // console.log('imageID :' + imageId);
    this.editorFacadeService.loadImageFromServer(imageId);
  }
}
