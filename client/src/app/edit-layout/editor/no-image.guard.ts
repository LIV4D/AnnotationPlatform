import { EditorService } from './editor.service';
import { ROUTES } from './../../routes';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()
export class NoImageGuard implements CanActivate {
    constructor(public router: Router, public editorService: EditorService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if ((this.editorService.imageLocal) || (this.editorService.imageServer) || localStorage.getItem('imageId')) {
            // If there is an image let user go to editor
            return true;
        }

        this.router.navigate(['/' + ROUTES.GALLERY]);
        return false;
    }
}
