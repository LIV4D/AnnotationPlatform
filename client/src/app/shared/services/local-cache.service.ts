import { Injectable } from '@angular/core';
import { ThrowStmt } from '@angular/compiler';
import { delay, AsyncExecutionQueue } from '../misc/async-utils';
import { isNullOrUndefined } from 'util';
import { LoginService } from './auth/login.service';
import { isUndefined } from 'underscore';

// @ts-ignore
indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB;
// @ts-ignore
IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction;



@Injectable({
    providedIn: 'root'
})
export class LocalCacheService {

    private CACHE_VERSION = 1.0;
    private CACHE_NAME = 'CaduceLocalStorage';
    private _ressources = new Array<LocalCachedRessource<any>>();
    private _db: IDBDatabase = undefined;
    private _tables: string[] = [];

    constructor(private loginService: LoginService) {
    }

    public getRessource<T>(index: RessourceIndex, fetch: () => Promise<T>): LocalCachedRessource<T> {
        const ressource = this._ressources.find(r => r.index === index);
        if (!isNullOrUndefined(ressource))
            return ressource;
        this.initTable(index.table);
        return new LocalCachedRessource<T>(index, fetch, this);
    }

    async store<T>(index: RessourceIndex, value: T): Promise<boolean> {
        const table = this._db.transaction(index.table).objectStore(index.table);
        const request = table.add(value, index.key);
        let r = undefined;
        request.onsuccess = e => r=true;
        request.onerror = e => r=false;

        while(r===undefined)
            await delay(5);
        return r;
    }

    async read<T>(index: RessourceIndex): Promise<T> {
        const table = this._db.transaction(index.table, 'readonly')
                              .objectStore(index.table);
        const request = table.get(index.key);
        let r = null;
        request.onsuccess = e => r=e.returnValue;
        request.onerror = e => r=undefined;

        while(r===null)
            await delay(5);
        return r;
    }

    async delete(index: RessourceIndex) {
        const table = this._db.transaction(index.table)
                              .objectStore(index.table);
        const request = table.delete(index.key);
        let r = undefined;
        request.onsuccess = e => r=true;
        request.onerror = e => r=false;

        while(r===undefined)
            await delay(5);
        return r;
    }

    protected async initLocalCache(): Promise<boolean> {
        if (this._db !== undefined)
            return;
        this._db = null;
        const dbRequest = indexedDB.open(this.CACHE_NAME, this.CACHE_VERSION);
        let r: boolean = undefined;
        dbRequest.onerror = e => {
            alert("This application need's an access to local storage.");
            this._db = undefined;
            this.loginService.logout();
            r = false;
        };
        dbRequest.onsuccess = e => {
            const db = dbRequest.result;
            this._db = db;
            db.onerror = e => {
                console.warn("Error when accesing the local storage.")
            }
            r = true;
        }
        dbRequest.onupgradeneeded = e => {
            this.clearLocalCache().then(() => {
                this.initLocalCache().then(v => r = v);
            });
        };

        while (r === undefined)
            await delay(100);
        return r;
    }

    async clearLocalCache(): Promise<void> {
        if (this._db !== undefined) {
            if (this._db === null)
                await this.waitDbAccess();
            const db = this._db;
            this._db = undefined;
            db.close();
        }
        const deleteRequest = indexedDB.deleteDatabase(this.CACHE_NAME);
        let isDeleted = false;
        deleteRequest.onsuccess = e => { isDeleted = true; };
        deleteRequest.onerror = e => { throw Error('Error when clearing local storage.') };
        while (!isDeleted)
            await delay(5);
    }

    protected initTable(tableName) {
        if(this._tables.includes(tableName))
            return;

        if(!this._db.objectStoreNames.contains(tableName)){
            const table = this._db.createObjectStore(tableName);
        }

        this._tables.push(tableName);
    }

    protected async waitDbAccess(): Promise<boolean> {
        if (this._db === undefined)
            return await this.initLocalCache();

        while (this._db === null)
            await delay(5);

        return this._db !== undefined;
    }

}

export class LocalCachedRessource<T> {
    protected _fetch: () => Promise<T>;
    protected _index: RessourceIndex;
    protected _cached: boolean = undefined;
    protected _value: T;
    protected _fetchQueue = new AsyncExecutionQueue();

    constructor(index: RessourceIndex, fetch: () => Promise<T>, protected cacheService: LocalCacheService) {
        this._fetch = fetch;
        this._index = index;
    }

    /**
     * Get the ressource value asynchrously.
     * The method check first if the ressource is loaded in RAM, else if it is cached on the disk 
     * otherwise the ressource is dowloaded and cached on the disk.
     * 
     * @param load If true, the ressource is loaded in RAM if it was not already the case.
     * @param cache If true, the ressource is cached on disk if it was not already the case.
     */
    async get(load=false, cache=true): Promise<T> {
        if(this._value!==undefined)
            return this._value;

        let v:T;
        if (this._cached===undefined) {
            v = await this.cacheService.read(this._index);
            if(v!==undefined){
                this._cached = true;
                return v;
            } else
                this._cached = false;
        }

        await this._fetchQueue.waitEmpty();

        if (this._cached)
            v = await this.cacheService.read(this._index);
        else
            v = await this.fetch(false, cache);
        
        if(load)
            this._value = v;
        
        return v;
    }

    /**
     * Download the ressource value.
     * The values stored on the disk cache and in RAM are updated. 
     * 
     * @param load If true, the ressource is loaded in RAM or it was not already the case.
     * @param cache If true, the ressource is cached on disk if it was not already the case.
     */
    async fetch(load=false, cache=true): Promise<T> {
        const token = await this._fetchQueue.queue();

        const v = await this._fetch();
        if (cache || this._cached) {
            await this.cacheService.store(this._index, v);
            this._cached = true;
        }
        if(load || !isUndefined(this._value))
            this._value = v;

        token.done();
        return v;
    }

    /**
     * Asynchronously load the ressources value in RAM.
     * Equivalent to this.get(load=true, cache=true).
     */
    async load(): Promise<T> {
        return await this.get(true);
    }

    /**
     * Delete the ressource value from RAM.
     */
    unload() {
        if(isUndefined(this._value))
            return;
        delete this._value;
        this._value = undefined;
    }

    /**
     * Delete the ressource value from the disk cache asynchronously.
     */
    async uncache(): Promise<boolean>{
        if(!this._cached)
            return true;

        if(! await this.cacheService.delete(this._index))
            return false;
        this._cached = false;
        return true;
    }

    /**
     * Delete the ressource value from RAM and from the disk cache.
     */
    async delete(): Promise<boolean> {
        if(! await this.uncache())
            return false;
        
        this.unload()
        return true;
    }

    get index(): RessourceIndex {
        return this._index;
    }

    get type(): any {
        return typeof this._value;
    }

}

export class LocalEditableRessource<T> extends LocalCachedRessource<T>{
    protected _push: (v: T) => Promise<boolean>;
    protected _pushNeeded = false;

    constructor(index: RessourceIndex, fetch: () => Promise<T>, push: (v: T) => Promise<any>, 
    cacheService: LocalCacheService) {
        super(index, fetch, cacheService);
        this._push = push;
    }

    /**
     * Force a reset of the local representation of the ressource (in RAM and on disk) if any.
     */
    async reset(): Promise<T> {
        if(this._fetchQueue.isEmpty() && !this._cached && isUndefined(this._value))
            return;

        return await this.fetch(false, false);
    }

    /**
     * Set the local representation of the ressource to the given value. 
     * The RAM version is set synchronously, the disk cache is set asynchronously.
     * @param value The new value of the ressource.
     * @param push If true, the new ressource value is also asynchronously pushed to the server.
     */
    async set(value: T, push=false): Promise<boolean> {
        if(this._value!==undefined)
            this._value = value;
        if(!await this.cacheService.store(this.index, value))
            return false;
        this._pushNeeded = true;
        if(!push)
            return true;
        return await this.push();
    }

    /**
     * Asynchronously push the local representation of the ressource to the server if needed.
     */
    async push(): Promise<boolean> {
        if(!this._pushNeeded)
            return true;
        if(isUndefined(this._value) || !this._cached)
            return false;

        const v = await this.get();
        this._pushNeeded = false;
        if(await this._push(v))
            return true;
        this._pushNeeded = true;
        return false;
    }

    get isPushNeeded(): boolean{
        return this._pushNeeded;
    }
}
30


interface RessourceIndex {
    table: string;
    key: string;
}