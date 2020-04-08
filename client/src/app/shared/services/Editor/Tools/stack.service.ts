export class Stack<T> {
    _store: T[];
    _head = -1;
    _capacity = -1;
    _numberOfItems = 0;

    constructor(capacity: number) {
        this._capacity = capacity;
        this._store = new Array(capacity);
    }

    push(val: T): void {
        this._head = (this._head + 1) % this._capacity;
        this._store[this._head] = val;
        if (this._numberOfItems < 20) {
            this._numberOfItems += 1;
        }
    }

    pop(): T | undefined {
        let result;
        if (this._numberOfItems > 0) {
            result = this._store[this._head];
            if (this._head === 0) {
                this._head = this._capacity - 1;
            } else {
                this._head -= 1;
            }
            this._numberOfItems -= 1;
        }
        return result;
    }

    peek(): T | undefined {
        if (this._head >= 0) {
            return this._store[this._head];
        }
        return undefined;
    }

    getLength(): number {
        return this._numberOfItems;
    }

    clear(): void {
        this._store = new Array(this._capacity);
        this._head = -1;
        this._numberOfItems = 0;
    }
}
