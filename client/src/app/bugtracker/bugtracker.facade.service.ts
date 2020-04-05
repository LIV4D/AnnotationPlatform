import { BugtrackerService } from './../shared/services/bugtracker.service';
import { Injectable, Injector } from '@angular/core';

@Injectable()
export class BugtrackerFacadeService {

    constructor(public bugtrackerService: BugtrackerService) {  }

    getIsVisible(): boolean {
        return this.bugtrackerService.getIsVisible();
    }

    send(description: string): void {
        this.bugtrackerService.send(description);
    }

    // show(): void {
    //     console.log("show");
    //     setTimeout(() => { document.getElementById('bugDescriptionBox').focus(); }, 0);
    //     this.bugtrackerService.show();
    // }

    // hide(): void {
    //     this.bugtrackerService.hide();
    // }

}
