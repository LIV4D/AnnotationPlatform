import { IState } from './state.model';


export class StatesHandlerService{
    constructor(){}

    get states(): {[Key: string]: IState} {
        const states = {};
        Object.keys(this).forEach(key => {
            const v = this[key];
            if (v.__type_guard__ === "IState")
                states[key] = v as IState;
        });
        return states;
    }

    public resetAllStates(){
        Object.keys(this.states).forEach(key => this.states[key].reset());
    }

    public resetStates(){
        this.resetAllStates();
    }
}
