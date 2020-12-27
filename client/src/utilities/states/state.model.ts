import { Observable, Subscriber } from 'rxjs';
import { ɵALLOW_MULTIPLE_PLATFORMS } from '@angular/core';
import { ObservableBuffer } from './observable-buffer.model';
import { IReadOnlyState, DerivedState, DerivedStateOptions } from './derived-state.model';

export interface IState extends IReadOnlyState{
    reset(),
    isDefault(): boolean,
    fromJson(json: string): boolean,
}


type StateOptions<T> = { 
    validate?: (value: T) => T,
    toJson?: (value: T) => string,
    fromJson?: (json: string) => T,
};

export class State<T> extends ObservableBuffer<T> implements IState{
    protected _defaultValue: T;

    protected _validate: (value: T) => T;
    protected _fromJson: (json: string) => T;

    constructor(defaultValue: T, options: StateOptions<T>={}) {
        super({value:defaultValue, toJson: options.toJson});

        this._defaultValue = defaultValue;
        this._validate = options.validate || ((value:T) => value);
        this._fromJson = options.fromJson || ((json: string) => JSON.parse(json));
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
        if(this._value !== value)
            this._next(value);
        return true;
    }

    public reset() {
        if(this._value === this._defaultValue)
            return;
        this._next(this._defaultValue);
    }
  
    public validate(v: T): T {
        return v;
    }
    
    public fromJson(json: string): boolean {
        try{
            return this.set(this._fromJson(json));
        }catch(e){
            return false;
        }
    }

    public isDefault(): boolean {
        return this._value === this._defaultValue;
    }

    public map<D>(expr: (value:T)=>D, options: DerivedStateOptions<D>={}): DerivedState<D>{
        return new DerivedState<D>([this], expr, options);
    }
  
    set value(v: T) {
      this.set(v);
    }

    set P(v: T){
        this.set(v);
    }

    get P(): T{
        return this._value;
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