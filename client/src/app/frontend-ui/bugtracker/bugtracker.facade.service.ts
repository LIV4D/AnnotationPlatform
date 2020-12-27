import { BugtrackerService } from '../../shared/services/bugtracker.service';
import { Injectable, Injector } from '@angular/core';

@Injectable()
export class BugtrackerFacadeService {

    constructor(public bugtrackerService: BugtrackerService) {  }

    send(description: string): void {
        this.bugtrackerService.send(description);
    }

}
