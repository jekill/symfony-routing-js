export interface IContext {
    base_url: string,
    prefix?: string,
    host?: string,
    scheme?: string;
}

export interface IRoute {
    tokens: Array<Array<string>>,
    defaults: {},
    requirements?: any|{_scheme: string},
    hosttokens?: any
}
export interface IRoutes {
    [index: string]: IRoute
}

const defaultContext: IContext = {
    base_url: '',
    prefix: '',
    host: '',
    scheme: ''
};

export class Router {
    routes: Map<string,IRoute>;

    constructor(private context: IContext = defaultContext,
                routes: IRoutes) {
        // this.routes = new Map(<any>routes);
        let c = [];
        this.routes = new Map();

        Object.keys(routes).forEach((path)=>{
            this.routes.set(path,routes[path]);
        });



        // this.context = Object.assign({}, defaultContext, context);
    }


    set baseUrl(baseUrl: string) {
        this.context.base_url = baseUrl;
    }

    get baseUrl() {
        return this.context.base_url;
    }


    set prefix(prefix) {
        this.context.prefix = prefix;
    }

    set scheme(scheme) {
        this.context.scheme = scheme;
    };

    get scheme() {
        return this.context.scheme;
    };

    set host(host) {
        this.context.host = host;
    };

    get host() {
        return this.context.host;
    };

    // get routes() {
    //     return this.routes;
    // }
    //
    // set routes(value) {
    //     this.routes = new Map(value);
    // }


    /**
     * @param prefix
     * @param params
     * @param add
     */
    buildQueryParams(prefix: string, params: Array<string>|Object, add: Function) {
        let name;
        const rbracket = new RegExp(/\[\]$/);

        if (params instanceof Array) {
            params.forEach((val, i) => {
                if (rbracket.test(prefix)) {
                    add(prefix, val);
                } else {
                    this.buildQueryParams(prefix + '[' + (typeof val === 'object' ? i : '') + ']', val, add);
                }
            });
        } else if (typeof params === 'object') {
            for (name in params) {
                this.buildQueryParams(prefix + '[' + name + ']', params[name], add);
            }
        } else {
            add(prefix, params);
        }
    }


    /**
     * Returns a raw route object.
     *
     */
    getRoute(name): IRoute {
        var prefixedName = this.context.prefix + name;
        if (!this.routes.has(prefixedName)) {
            // Check first for default route before failing
            if (!this.routes.has(name)) {
                throw new Error('The route "' + name + '" does not exist.');
            }
        } else {
            name = prefixedName;
        }

        return <IRoute>this.routes.get(name);
    };


    generate(name: string, opt_params: {[index: string]: {}} = {}, absolute: boolean = false): string {
        var route = (this.getRoute(name)),
            params = opt_params || {},
            unusedParams = Object.assign({}, params),
            url = '',
            optional = true,
            host = '';

        route.tokens.forEach(function (token) {
            if ('text' === token[0]) {
                url = token[1] + url;
                optional = false;

                return;
            }

            if ('variable' === token[0]) {

                var hasDefault = route.defaults.hasOwnProperty(token[3]);

                if (false === optional || !hasDefault ||
                    (params.hasOwnProperty(token[3]) && params[token[3]] != route.defaults[token[3]])) {
                    let value;

                    if (params.hasOwnProperty( token[3])) {
                        value = params[token[3]];
                        delete unusedParams[token[3]];
                        // goog.object.remove(unusedParams, token[3]);

                    } else if (hasDefault) {
                        value = route.defaults[token[3]];
                    } else if (optional) {
                        return;
                    } else {
                        throw new Error('The route "' + name + '" requires the parameter "' + token[3] + '".');
                    }

                    var empty = true === value || false === value || '' === value;

                    if (!empty || !optional) {
                        var encodedValue = encodeURIComponent(value).replace(/%2F/g, '/');

                        if ('null' === encodedValue && null === value) {
                            encodedValue = '';
                        }

                        url = token[1] + encodedValue + url;
                    }

                    optional = false;
                } else if (hasDefault) {
                    // goog.object.remove(unusedParams, token[3]);
                    delete unusedParams[token[3]];
                }

                return;
            }

            throw new Error('The token type "' + token[0] + '" is not supported.');
        });

        if (url === '') {
            url = '/';
        }

        route.hosttokens.forEach( function (token) {
            var value;

            if ('text' === token[0]) {
                host = token[1] + host;

                return;
            }

            if ('variable' === token[0]) {
                if (params.hasOwnProperty(token[3])) {
                    value = params[token[3]];
                    delete unusedParams[token[3]];
                } else if (route.defaults.hasOwnProperty(token[3])) {
                    value = route.defaults[token[3]];
                }

                host = token[1] + value + host;
            }
        });

        url = this.context.base_url + url;
        if (route.requirements.hasOwnProperty("_scheme") && this.scheme != route.requirements["_scheme"]) {
            url = route.requirements["_scheme"] + "://" + (host || this.host) + url;
        } else if (host && this.host !== host) {
            url = this.scheme + "://" + host + url;
        } else if (absolute === true) {
            url = this.scheme + "://" + this.host + url;
        }

        if (Object.keys(unusedParams).length > 0) {
            var prefix;
            var queryParams = [];
            var add = function (key, value) {
                // if value is a function then call it and assign it's return value as value
                value = (typeof value === 'function') ? value() : value;

                // change null to empty string
                value = (value === null) ? '' : value;

                queryParams.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
            };

            for (prefix in unusedParams) {
                this.buildQueryParams(prefix, unusedParams[prefix], add);
            }

            url = url + '?' + queryParams.join('&').replace(/%20/g, '+');
        }

        return url;
    }


}
