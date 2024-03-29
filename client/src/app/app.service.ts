import { Injectable } from '@angular/core';
@Injectable()
export class AppService {

    public loading: boolean;
    public keyEventsEnabled: boolean;
    public localEditing: boolean;
    public pointerDetected: boolean;

    constructor() {
        this.loading = false;
        this.keyEventsEnabled = true;
        this.localEditing = false;
        this.pointerDetected = false;
    }
}
