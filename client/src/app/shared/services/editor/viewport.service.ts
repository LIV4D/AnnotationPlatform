import { Injectable} from '@angular/core';
import { Point } from '../../models/point.model';

@Injectable({
  providedIn: 'root',
})
export class ViewportService {
  viewPort: HTMLDivElement;

  constructor() {}

  // Return the width/height ratio of the viewport (displayed).
  viewportRatio(): number {
    return (
      this.viewPort.getBoundingClientRect().width /
      this.viewPort.getBoundingClientRect().height
    );
  }

  getMousePositionInDisplaySpace(clientPosition: Point): Point {
    const x = clientPosition.x - this.viewPort.getBoundingClientRect().left;
    const y = clientPosition.y - this.viewPort.getBoundingClientRect().top;

    return new Point(x, y);
  }

}
