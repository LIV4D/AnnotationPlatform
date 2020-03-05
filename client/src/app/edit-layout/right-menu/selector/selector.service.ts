import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants';

@Injectable()
export class SelectorService {
    
    constructor () {}

    private _diagnostic = 0;
    private _edema = false;
    public enabled = false;

    public diagnosticChanged = new BehaviorSubject<number>(0);
    public edemaChanged = new BehaviorSubject<boolean>(false);

    getState(): string {
       return this._diagnostic.toString()+(this._edema?"E":"");
    }

    setState(state: string): void {
        this.diagnostic = parseInt(state[0]);
        this.edema = state.endsWith("E");
    }

    get diagnostic(): number {
        return this._diagnostic;
    }

    set diagnostic(d: number) {
        this._diagnostic = d;
        this.diagnosticChanged.next(d);
    }

    get edema(): boolean {
        return this._edema;
    }

    set edema(e: boolean) {
        this._edema = e;
        this.edemaChanged.next(e);
    }
}