import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class SaveSubmissionService {

    constructor() {
    }

    // Return the shortcut command depending on the OS of the user's system
    getSaveShortCutToolTipText(){
      return navigator.platform.indexOf('Mac') === -1 ? '(Ctrl + S)' : '(Cmd + S)';
    }
}
