import { isNullOrUndefined } from 'util';

export class Point {

    constructor(public x: number, public y: number) {}


    public copy(): Point {
        return new Point(this.x, this.y);
    }

    public clipX(min:number, max:number): Point {
        const p = this.copy();
        if(!isNullOrUndefined(min))
            p.x = Math.max(p.x, min);
        if(!isNullOrUndefined(max))
            p.x = Math.min(p.x, max);    
        return p;
    }

    public clipY(min:number, max:number): Point {
        const p = this.copy();
        if(!isNullOrUndefined(min))
            p.y = Math.max(p.y, min);
        if(!isNullOrUndefined(max))
            p.y = Math.min(p.y, max);    
        return p;
    }

    public clip(minX: number, maxX: number, minY: number, maxY: number): Point;
    public clip(min: Point, max: Point): Point;
    public clip(a1: number|Point, a2: number|Point, a3?: number, a4?:number): Point {
        let minX = 0, maxX = 0, minY = 0, maxY = 0;
        if(a1 instanceof Point && a2 instanceof Point){
            minX = a1.x, maxX = a2.x; 
            minY = a1.y, maxY = a2.y;
        }else if(typeof a1 === 'number' && typeof a2 === 'number'){
            minX = a1, maxX = a2; 
            minY = a3, maxY = a4;
        }
        return this.clipX(minX, maxX).clipY(minY, maxY);
    }

    

}
