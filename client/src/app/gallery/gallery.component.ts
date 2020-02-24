import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { AppService } from '../shared/services/app.service';
import { Router } from '@angular/router';
import { GalleryService } from '../shared/services/Gallery/gallery.service';
import { EditorService } from '../shared/services/Editor/editor.service';
import { merge } from 'rxjs';
import { of as observableOf } from 'rxjs';
import { startWith, switchMap, catchError } from 'rxjs/operators';
import { IGallery } from '../shared/services/Gallery/gallery.interface';
import { LocalStorage } from '../shared/services/Editor/local-storage.model';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {

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

  constructor(public appService: AppService, public router: Router, public galleryService: GalleryService,
              public editorService: EditorService) {
    this.showPagination = false;
    this.length = 0;
    this.pageSize = 15;
    this.editorService.imageLoaded = false;
  }

  ngOnInit(): void {
      this.editorService.imageServer = null;
      this.editorService.imageLocal = null;
      this.getImageTypes();
      this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
      this.getImages();
  }

  getImages(): void {
    // Create filters
    // WARNING : key must correspond to valid column in model
    const filtersObj = {'imageType.name': this.imageTypeField.nativeElement.value,
        eye: this.eyeSideField.nativeElement.value,
        hospital: this.hospitalField.nativeElement.value,
        patient: this.patientField.nativeElement.value,
        visit: this.visitField.nativeElement.value,
        code: this.codeField.nativeElement.value,
    };

    const filters = JSON.stringify(filtersObj);
    merge(this.sort.sortChange, this.paginator.page)
        .pipe(
          startWith({}),
          switchMap(
            () => {
              setTimeout(() => this.appService.loading = true);
    // tslint:disable-next-line: max-line-length
              return this.galleryService.getImages(this.sort.active, this.sort.direction, this.paginator.pageIndex, this.pageSize, filters);
          }),
          catchError(() => {
              setTimeout(() => this.appService.loading = false);
              return observableOf([]);
          })
        ).subscribe((data: IGallery) => {
            this.length = data.objectCount;
            this.data = data.objects;
            setTimeout(() => this.appService.loading = false);
        });
  }

  onLocalImageLoaded(event: any): void {
    console.log('GalleryComponent::onLocalImageLoaded()');

    const reader: FileReader = new FileReader();
    reader.onload = () => {
        const image = new Image();
        image.onload = () => {
            this.appService.localEditing = true;
            this.editorService.imageLocal = image;
            this.editorService.imageId = 'local';
            LocalStorage.clear();
            this.router.navigate(['/' + 'editor']);
        };
        image.src = reader.result as string;
    };

    reader.readAsDataURL(event.target.files[0]);
  }

  // Retrieves the image types from the server
  getImageTypes(): void {
    this.galleryService.getImageTypes().subscribe(res => {
        this.galleryService.selected = res[0];
        this.imageTypes = res;
    });
  }

  // loadImage(imageId: string): void {
  //     this.appService.localEditing = false;
  //     localStorage.setItem('previousPage', 'gallery');
  //     this.editorService.loadImageFromServer(imageId);
  // }
}
