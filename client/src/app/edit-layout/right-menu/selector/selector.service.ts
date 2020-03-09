import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants';
import { splitAtColon } from '@angular/compiler/src/util';
import { stat } from 'fs';

@Injectable()
export class SelectorService {
    
    constructor () {}

    private _diagnostic = 0;
    private _edema = 0;
    public enabled = false;

    public diagnosticChanged = new BehaviorSubject<number>(0);
    public edemaChanged = new BehaviorSubject<number>(0);

    getState(): string {
       return this._diagnostic.toString()+"M"+this._edema.toString();
    }

    setState(state: string): void {
        const stateL = state.split("M", 2);
        this.diagnostic = parseInt(stateL[0]);
        if(stateL.length==1){
            this.edema = 0;
        } else {
            this.edema = parseInt(stateL[1]);
        }
    }

    get diagnostic(): number {
        return this._diagnostic;
    }

    set diagnostic(d: number) {
        this._diagnostic = d;
        this.diagnosticChanged.next(d);
    }

    get edema(): number {
        return this._edema;
    }

    set edema(e: number) {
        this._edema = e;
        this.edemaChanged.next(e);
    }
}