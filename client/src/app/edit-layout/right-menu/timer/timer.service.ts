import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class TimerService {

    private _time = 0;
    private timer = null;

    public timeStrChanged = new BehaviorSubject<string>('00:00');
    public runningChanged = new BehaviorSubject<boolean>(false);

    constructor () {}

    get timeStr(): string {
        return this.timeStrChanged.getValue();
    }

    get running(): boolean {
        return this.runningChanged.getValue();
    }

    getTimeStr(): string {
        const t = this._time;
        const t_h = Math.floor(t / 3600);
        const t_m = Math.floor((t % 3600) / 60);
        const t_s = t % 60;

        let m = t_m.toString();
        if (m.length === 1) {
            m = '0' + m;
        }
        let s = t_s.toString();
        if (s.length === 1) {
            s = '0' + s;
        }

        if (t_h > 0) {
            return t_h.toString() + ':' + m + ':' + s;
        }
        return m + ':' + s;
    }

    setTimeStr(t_str: string): void {
        const t_split = t_str.split(':');
        let t = 0;
        if (t_split.length === 2) {
            t += parseInt(t_split[0], 10) * 60;
            t += parseInt(t_split[1], 10);
        } else if (t_split.length === 3) {
            t += parseInt(t_split[1], 10) * 3600;
            t += parseInt(t_split[1], 10) * 60;
            t += parseInt(t_split[2], 10);
        }
        this._time = t;
        this.timeStrChanged.next(this.getTimeStr());
    }

    get time(): number {
        return this._time;
    }

    set time(t: number) {
        this._time = t;
        this.timeStrChanged.next(this.getTimeStr());
    }

    start(): void {
        if (this.timer === null) {
            this.timer = setInterval(() => { this.time += 1; }, 1000);
            this.runningChanged.next(true);
        }
    }

    stop(): void {
        if (this.timer !== null) {
            clearInterval(this.timer);
            this.timer = null;
            this.runningChanged.next(false);
        }
    }

    reset(): void {
        this.time = 0;
        this.stop();
    }
}
