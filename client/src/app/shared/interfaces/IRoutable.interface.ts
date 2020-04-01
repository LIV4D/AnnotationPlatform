import { ActivatedRoute, Router } from '@angular/router';

export interface IRoutable {
    router: Router;
    activatedRoute: ActivatedRoute;
    /**
     * Call this function within the constructor of your component.
     * Within this function, you will subscribe to this.activatedRoute.queryParamMap and within the subscription,
     * you can assign all of your url parameters to your component parameters. (See management component for implementation)
     */
    applyUrlParams(): void;
    /**
     * Call this function whenever you wish to update the URL.
     * Straightforward, create a variable of type Params with all of the parameters that you wish within it.
     * In addition, the Params variable must also contain a version variable which simply changes everytime it's called
     * with Math.random() for example. Due to an oversight in Angular, if there are only minor changes brought to the Params,
     * the route will not update.
     * Afterwards, add the following lines of code:
     * this.router.navigate(
     *      [],
     *       {
     *           relativeTo: this.activatedRoute,
     *           queryParams,
     *           queryParamsHandling: 'merge'
     *       }
     *   )
     */
    changeUrlParams(): void;
}
