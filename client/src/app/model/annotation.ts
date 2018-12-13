import { Point } from './point';


export class Annotation {

    constructor() {
    }
    points: Point[] = [];
    path: Path2D;
    color = 'blue';

    updatePath(): void {
        this.path = new Path2D();
        this.points.forEach( (point, index) => {
            if (index === 0) {
                this.path.moveTo(point.x, point.y);
            } else {
                this.path.lineTo(point.x, point.y);
            }
        });
    }

}
