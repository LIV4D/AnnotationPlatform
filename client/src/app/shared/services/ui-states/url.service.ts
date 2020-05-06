import { Injectable } from '@angular/core';
import { StatesHandlerService } from './states-handler.service';
import { isNullOrUndefined } from 'util';
import { IState } from '../../models/state.model';
import { Subscription, Subscriber, Observable } from 'rxjs';
import { ActivatedRoute, ParamMap, Router, NavigationEnd } from '@angular/router';
import { stringify } from 'querystring';
import { Tab } from '../../constants/tab';
import { filter } from 'rxjs/operators';

type Explicity = 'always' | 'never' | 'not-default' | 'inherit';

interface UrlStatesOptions {
    stateName: string;
    alias: string;
    explicity: Explicity;
};

interface UrlState {
    state: IState;
    explicit: boolean
    options: UrlStatesOptions;
    subscription?: Subscription;
    tab: Tab;
}

@Injectable({
    providedIn: 'root'
})
export class UrlService {

    protected static _statesOptions: { [Key: string]: UrlStatesOptions[] } = {};
    public static State(alias?: string, explicity: Explicity = 'inherit') {
        return (cls: any, name: string) => {
            const clsName = cls.constructor.name;
            if (UrlService._statesOptions[clsName] === undefined)
                UrlService._statesOptions[clsName] = [];
            UrlService._statesOptions[clsName].push({
                stateName: name,
                alias: alias || name,
                explicity: explicity,
            });
        };
    }

    constructor(private route: ActivatedRoute, private router: Router) {
        this.router.events.pipe(filter(e => e instanceof NavigationEnd))
                          .subscribe(e => this.onNavigationEnd(e as NavigationEnd));
        Object.keys(Tab).forEach(tab => { this._urlStates[tab] = new Map<string, UrlState>(); });
        this.onNavigationEnd();
    }

    protected onNavigationEnd(event?: NavigationEnd) {
        const route = this.router.routerState.snapshot.root.firstChild;
        this.updateStatesFromUrl(route.queryParamMap);
        this.updateTab(Tab[route.data['tab']] || null);
    }

    // -----    TAB     ------
    protected _tab: Tab = null;
    protected _tabSubscribers: Subscriber<Tab>[] = [];

    protected updateTab(tab: Tab){
        if (tab === this._tab)
            return;
        this._tab = tab;
        this._tabSubscribers.forEach(sub => sub.next(tab));
    }

    get tab(): Tab {
        return this._tab;
    }

    public getTabSync(): Tab {
        const route = this.router.routerState.snapshot.root.firstChild;
        return Tab[route.data['tab']] || null;
    }

    get tabObservable(): Observable<Tab> {
        return new Observable<Tab>((sub: Subscriber<Tab>) => {
            this._tabSubscribers.push(sub);
            return function unsubscribe() {
                const i = this._tabSubscribers.indexOf(sub);
                if (i > -1)
                    this._tabSubscribers.splice(i);
            };
        });
    }

    // -----    STATES  ------
    protected _urlStates: { [Key: string]: Map<string, UrlState> } = {};
    protected _updateUrlTimer: number = null;
    protected _lockUpdateUrl = false;
    protected _urlUpdateNeeded = false;

    public registerStates(handler: StatesHandlerService, cls: any, tab: Tab) {
        const statesOptions = UrlService._statesOptions[cls.name];
        if (!isNullOrUndefined(statesOptions)) {
            statesOptions.forEach(stateOpt => {
                const state = handler[stateOpt.stateName];
                const urlState = {
                    state: state,
                    options: stateOpt,
                    subscription: state.jsonObervable.subscribe(json => this.aknowledgeStateChange(urlState, json)),
                    tab: tab,
                } as UrlState;

                if (!isNullOrUndefined(this._urlStates[tab].get(stateOpt.alias))) {
                    const previousUrlState = this._urlStates[tab].get(stateOpt.alias);
                    console.warn("Multiple url states share the same alias '" + stateOpt.alias + "'!")
                    previousUrlState.subscription.unsubscribe();
                }
                this._urlStates[tab].set(stateOpt.alias, urlState);
            });
        }
    }

    protected updateStatesFromUrl(urlParams: ParamMap) {
        const tab = this.getTabSync();
        if (isNullOrUndefined(tab))
            return;

        // Reset states explicity
        this._urlStates[tab].forEach(urlState => {
            urlState.explicit = false;
        });

        // Read url parameters
        this.lockUrlUpdate();
        urlParams.keys.forEach(key => {
            let urlState = this._urlStates[tab].get(key);
            if (!isNullOrUndefined(urlState)) {
                urlState.explicit = true;
                urlState.state.fromJson(urlParams.get(key));
            }
        });
        this.unlockUrlUpdate();
    }

    protected aknowledgeStateChange(urlState: UrlState, json: string) {
        switch (urlState.options.explicity) {
            case 'always':
                break;
            case 'never':
                return;
            case 'not-default':
                if (urlState.state.isDefault())
                    return;
                break;
            case 'inherit':
                if (!urlState.explicit)
                    return;
                break;
        }
        urlState.explicit = true;
        if (urlState.tab === this.tab)
            this.updateUrl();
    }

    public lockUrlUpdate() {
        if (this._updateUrlTimer){
            window.clearTimeout(this._updateUrlTimer);
            this._updateUrlTimer = null;
        }
        this._lockUpdateUrl = true;
    }

    public unlockUrlUpdate() {
        this._lockUpdateUrl = false;
        if (this._urlUpdateNeeded)
            this.updateUrl(true);
    }

    public updateUrl(force = false) {
        const tab = this.getTabSync();
        if (isNullOrUndefined(tab))
            return;

        // Check update lock and timer
        if (force) {
            if (this._updateUrlTimer){
                window.clearTimeout(this._updateUrlTimer);
                this._updateUrlTimer = null;
            }
        } else if (this._lockUpdateUrl || this._updateUrlTimer !== null) {
            this._urlUpdateNeeded = true;
            return;
        }
        this._urlUpdateNeeded = false;
        this._updateUrlTimer = window.setTimeout(() => {
            this._updateUrlTimer = null;
            if (this._urlUpdateNeeded){
                this.updateUrl();
            }
        }, 100);

        // Fetch managed url keys
        const newQueryParams = new Map<string, string>();
        const queryParamsMap = this.router.routerState.snapshot.root.queryParamMap;
        queryParamsMap.keys.forEach(key => {
            if (this._urlStates[tab].has(key))
                newQueryParams[key] = null;
        });

        // Add managed explicit url
        this._urlStates[tab].forEach((urlState, alias) => {
            if (urlState.explicit)
                newQueryParams[alias] = urlState.state.toJson();
        });

        // Merge the updated query params to the URL
        this.router.navigate([], {
            relativeTo: this.router.routerState.root,
            queryParams: newQueryParams,
            queryParamsHandling: 'merge',
            replaceUrl: true
        });

        // console.log('updateURL', this._urlStates[tab], newQueryParams);
    }

}