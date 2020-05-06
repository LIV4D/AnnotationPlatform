import { Observable, Subscriber } from 'rxjs';


export interface IState{
    reset(),
    toJson(): string,
    fromJson(json: string): boolean,
    isDefault(): boolean,
    jsonObervable: Observable<string>,
}


type StateOptions<T> = { 
    validate?: (value: T) => T,
    toJson?: (value: T) => string,
    fromJson?: (json: string) => T,
};

export class State<T> extends Observable<T> implements IState{
    protected _value: T;
    protected _defaultValue: T;
    protected _subscribers: Subscriber<T>[] = [];
    protected _jsonObservable: Observable<string>;
    protected _jsonSubscribers: Subscriber<string>[] = [];

    protected _validate: (value: T) => T;
    protected _toJson: (value: T) => string;
    protected _fromJson: (json: string) => T;

    constructor(defaultValue: T, options: StateOptions<T>={}) {
        super((subscriber: Subscriber<T>) => {
            this._subscribers.push(subscriber);
            return function unsubscribe(){
                const i = this._subscribers.indexOf(subscriber);
                if (i > -1){
                    this._subscribers.splice(i);
                }
            };
        });

        this._value = defaultValue;
        this._defaultValue = defaultValue;
        this._validate = options.validate || ((value:T) => value);
        this._toJson = options.toJson || ((value:T) => JSON.stringify(value));
        this._fromJson = options.fromJson || ((json: string) => JSON.parse(json));

        this._jsonObservable = new Observable<string>( (subscriber: Subscriber<string>) => {
            this._jsonSubscribers.push(subscriber);
            return function unsubscribe(){
                const i = this._jsonSubscribers.indexOf(subscriber);
                if (i > -1){
                    this._subscribers.splice(i);
                }
            };
        });
    }
  
    public get(): T {
        return this._value;
    }

    public set(value: T): boolean {
        try{
            value = this.validate(value);
        } catch(e) {
            if(e instanceof IgnoreStateUpdate)
                return true;
            else if(e instanceof InvalidStateUpdate)
                return false;
        }
        if(this._value !== value){
            this._value = value;
            this._next(value);
        }
        return true;
    }

    public reset() {
        if(this._value === this._defaultValue)
            return;
        this._value = this._defaultValue;
        this._next(this._value);
    }

    protected _next(v: T) {
        this._subscribers.forEach(s => s.next(v));
        const json = this.toJson();
        this._jsonSubscribers.forEach(s => s.next(json));
    }
  
    public validate(v: T): T {
        return v;
    }

    public toJson(): string {
        return this._toJson(this._value);
    }

    public fromJson(json: string): boolean {
        try{
            return this.set(this._fromJson(json));
        }catch(e){
            return false;
        }
    }

    public get jsonObervable(): Observable<string> {
        return this._jsonObservable;
    }

    public isDefault(): boolean {
        return this._value === this._defaultValue;
    }
  
    set value(v: T) {
      this.set(v);
    }
  
    get value() {
      return this.get();
    }
  }

export class IgnoreStateUpdate extends Error{
      constructor(){
          super();
      }
}

export class InvalidStateUpdate extends Error{
    constructor(value: string){
        super("State invalid value "+value+".");
    }
}