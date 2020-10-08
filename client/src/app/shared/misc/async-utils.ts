import { queue } from 'rxjs/internal/scheduler/queue';


export function delay(ms: number): Promise<void> {
    return new Promise( resolve => setTimeout(resolve, ms) );
}


/**************************************************************** */
type TokenPromiseCb = (value?: ExecutionQueueToken | PromiseLike<ExecutionQueueToken>) => void;
type VoidPromiseCb = (value?: void | PromiseLike<void>) => void;

export class AsyncExecutionQueue{
    private _queue: TokenPromiseCb[] = [];
    private _waitEmptyCb: VoidPromiseCb[] = [];

    constructor(){}

    /**
     *  Enter the queue, the promise resolves when every execution before is done.
     *  Return an execution token. Call its method done() to free the queue.
     */
    queue(): Promise<ExecutionQueueToken>{
        if(this.isEmpty) {
            this._queue.push(undefined);
            return new Promise(resolve => resolve());
        } else 
            return new Promise(resolve => this._queue.push(resolve));
    }

    _tokenDone(token: ExecutionQueueToken){
        if(token._done)
            return;
        token._done = true;

        this._queue.shift();
        if (!this.isEmpty)
            setTimeout(() => this._queue[0](new ExecutionQueueToken(this)));
        else
            this._waitEmptyCb.forEach(cb => setTimeout(cb));
    }

    isEmpty(): boolean {
        return this._queue.length===0;
    }

    async waitEmpty(): Promise<void> {
        return new Promise(resolve => this._waitEmptyCb.push(resolve));
    }

}

class ExecutionQueueToken {
    public _done = false;
    constructor(private queue: AsyncExecutionQueue) {}

    done(){
        this.queue._tokenDone(this);
    }
}