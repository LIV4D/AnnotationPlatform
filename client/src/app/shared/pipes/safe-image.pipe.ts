import { Pipe,  PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({name: 'safeImage'})
export class SafeImagePipe  implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(html): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(html);
  }
}
