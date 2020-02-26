import { Injectable } from '@angular/core';
import { LayersService } from './../../../shared/services/Editor/layers.service';

@Injectable({
    providedIn: 'root'
})
export class LayersFacadeService {

    public layersService: LayersService;

    constructor(layersService: LayersService) {
        this.layersService = layersService;
    }

    public init() {
        this.layersService.init();
    }

}
