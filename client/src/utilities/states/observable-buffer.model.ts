import { Observable, Subscriber } from 'rxjs';

type ObservableBufferOptions<T> = { 
    toJson?: (value: T) => string,
    value?: T,
};

export class ObservableBuffer<T> extends Observable<T> {
    protected _value: T;
    protected _subscribers: Subscriber<T>[] = [];

    protected _toJson: (value: T) => string;
    protected _jsonObservable: Observable<string>;
    protected _jsonSubscribers: Subscriber<string>[] = [];
    
    constructor(options: ObservableBufferOptions<T>={}) {
        super((subscriber: Subscriber<T>) => {
            this._subscribers.push(subscriber);
            return function unsubscribe() {
                const i = this._subscribers.indexOf(subscriber);
                if (i > -1) {
                    this._subscribers.splice(i);
                }
            };
        });
        this._jsonObservable = new Observable<string>( (subscriber: Subscriber<string>) => {
            this._jsonSubscribers.push(subscriber);
            return function unsubscribe(){
                const i = this._jsonSubscribers.indexOf(subscriber);
                if (i > -1){
                    this._subscribers.splice(i);
                }
            };
        });
        this._value = options.value;
        this._toJson = options.toJson || ((value:T) => JSON.stringify(value));
    }

    public get(): T { return this._value; }

    get value(): T { return this._value; }

    protected _next(v: T) {
        this._value = v;
        this._subscribers.forEach(s => s.next(v));

        if(this._jsonSubscribers.length){
            const json = this.toJson();
            this._jsonSubscribers.forEach(s => s.next(json));
        }       
    }

    public toJson(): string {
        return this._toJson(this._value);
    }

    public get jsonObervable(): Observable<string> {
        return this._jsonObservable;
    }
}
