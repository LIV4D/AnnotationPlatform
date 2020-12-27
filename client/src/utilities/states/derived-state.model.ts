import { Observable, Subscriber, forkJoin } from 'rxjs';
import { isNullOrUndefined } from 'util';
import { ObservableBuffer } from "./observable-buffer.model";

export interface IReadOnlyState{
    toJson(): string,
    jsonObervable: Observable<string>,
}

export type DerivedStateOptions<T> = { 
    toJson?: (value: T) => string,
    value?: T,
};


export class DerivedState<T> extends ObservableBuffer<T> implements IReadOnlyState {
    protected _definition: (...args: any[]) => T;

    constructor(depends: ObservableBuffer<any>[] | Observable<any>[], definition: (...args: any[]) => T, options: DerivedStateOptions<T>={}) {
        super({value: options.value, toJson: options.toJson});
        this._definition = definition;
        forkJoin(...depends).subscribe(args => this._next(this._definition(...args)));

        if (isNullOrUndefined(options.value) && depends.findIndex(o => !(o instanceof ObservableBuffer)) === -1) {
            const dependenciesValues: any[] = [];
            // @ts-ignore
            depends.forEach(o => dependenciesValues.push(o.get()));
            this._next(definition(...dependenciesValues));
        }
    }

}
