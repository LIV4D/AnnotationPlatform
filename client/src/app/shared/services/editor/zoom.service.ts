import { Injectable } from '@angular/core';
import { State, Derived } from '../../models/state.model';
import { UrlService } from '../ui-states/url.service';
import { Tab } from '../../constants/tab';
import { StatesHandlerService as StatesService } from '../ui-states/states-handler.service';
import { Point } from '../../models/point.model';

// Min and max values for zooming
const ZOOM = {
    MIN: 1.0,
    MAX: 16.0,
};

@Injectable({
    providedIn: 'root',
})

// The service provides usefull function
// helping with the Widget Events
export class ZoomService extends StatesService {

    ZOOM = ZOOM;

    @UrlService.State('zoomFactor')
    zoomFactor = new State<number>(this.ZOOM.MIN, {
        validate: f => this.capZoomFactor(f)
    });

    @UrlService.State('zoomCenter')
    zoomCenter = new State<Point>(new Point(0,0), {
        validate: p => this.capZoomCenter(p)
    });


    constructor(private urlService: UrlService) {
        super();
        this.urlService.registerStates(this, ZoomService, Tab.EDITOR);
    }

    public capZoomValues(zoomFactor: number): number {
        if (zoomFactor > 1) {
            zoomFactor = 1;
        }
        else if (zoomFactor < 0) {
            zoomFactor = 0;
        }
        zoomFactor = ZOOM.MAX * zoomFactor + ZOOM.MIN;
        return zoomFactor;
    }

    public capZoomFactor(factor: number): number {
        return Math.min(Math.max(ZOOM.MIN, factor), ZOOM.MAX);
    }

    public capZoomCenter(center: Point): Point {
        return center;
    }

    // Change the zoom factor depending the differential
    public updateZoomFactor(delta: number) {
        // Keep zoom in range [100%, 600%]
        let zoomFactor = this.zoomFactor.get() * Math.exp(delta); // exp is used for acceleration
        // let zoomFactor = this.zoomFactor * (2 / (1 + Math.exp(delta)));
        
        this.zoomFactor.set(zoomFactor);
    }
}

