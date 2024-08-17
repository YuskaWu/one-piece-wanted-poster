try {
  self["workbox:core:7.0.0"] && _();
} catch {
}
const q = (s, ...e) => {
  let t = s;
  return e.length > 0 && (t += ` :: ${JSON.stringify(e)}`), t;
}, $ = q;
class h extends Error {
  /**
   *
   * @param {string} errorCode The error code that
   * identifies this particular error.
   * @param {Object=} details Any relevant arguments
   * that will help developers identify issues should
   * be added as a key on the context object.
   */
  constructor(e, t) {
    const n = $(e, t);
    super(n), this.name = e, this.details = t;
  }
}
try {
  self["workbox:routing:7.0.0"] && _();
} catch {
}
const F = "GET", R = (s) => s && typeof s == "object" ? s : { handle: s };
class b {
  /**
   * Constructor for Route class.
   *
   * @param {workbox-routing~matchCallback} match
   * A callback function that determines whether the route matches a given
   * `fetch` event by returning a non-falsy value.
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resolving to a Response.
   * @param {string} [method='GET'] The HTTP method to match the Route
   * against.
   */
  constructor(e, t, n = F) {
    this.handler = R(t), this.match = e, this.method = n;
  }
  /**
   *
   * @param {workbox-routing-handlerCallback} handler A callback
   * function that returns a Promise resolving to a Response
   */
  setCatchHandler(e) {
    this.catchHandler = R(e);
  }
}
class V extends b {
  /**
   * If the regular expression contains
   * [capture groups]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#grouping-back-references},
   * the captured values will be passed to the
   * {@link workbox-routing~handlerCallback} `params`
   * argument.
   *
   * @param {RegExp} regExp The regular expression to match against URLs.
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resulting in a Response.
   * @param {string} [method='GET'] The HTTP method to match the Route
   * against.
   */
  constructor(e, t, n) {
    const r = ({ url: c }) => {
      const a = e.exec(c.href);
      if (a && !(c.origin !== location.origin && a.index !== 0))
        return a.slice(1);
    };
    super(r, t, n);
  }
}
const G = (s) => new URL(String(s), location.href).href.replace(new RegExp(`^${location.origin}`), "");
class Q {
  /**
   * Initializes a new Router.
   */
  constructor() {
    this._routes = /* @__PURE__ */ new Map(), this._defaultHandlerMap = /* @__PURE__ */ new Map();
  }
  /**
   * @return {Map<string, Array<workbox-routing.Route>>} routes A `Map` of HTTP
   * method name ('GET', etc.) to an array of all the corresponding `Route`
   * instances that are registered.
   */
  get routes() {
    return this._routes;
  }
  /**
   * Adds a fetch event listener to respond to events when a route matches
   * the event's request.
   */
  addFetchListener() {
    self.addEventListener("fetch", (e) => {
      const { request: t } = e, n = this.handleRequest({ request: t, event: e });
      n && e.respondWith(n);
    });
  }
  /**
   * Adds a message event listener for URLs to cache from the window.
   * This is useful to cache resources loaded on the page prior to when the
   * service worker started controlling it.
   *
   * The format of the message data sent from the window should be as follows.
   * Where the `urlsToCache` array may consist of URL strings or an array of
   * URL string + `requestInit` object (the same as you'd pass to `fetch()`).
   *
   * ```
   * {
   *   type: 'CACHE_URLS',
   *   payload: {
   *     urlsToCache: [
   *       './script1.js',
   *       './script2.js',
   *       ['./script3.js', {mode: 'no-cors'}],
   *     ],
   *   },
   * }
   * ```
   */
  addCacheListener() {
    self.addEventListener("message", (e) => {
      if (e.data && e.data.type === "CACHE_URLS") {
        const { payload: t } = e.data, n = Promise.all(t.urlsToCache.map((r) => {
          typeof r == "string" && (r = [r]);
          const c = new Request(...r);
          return this.handleRequest({ request: c, event: e });
        }));
        e.waitUntil(n), e.ports && e.ports[0] && n.then(() => e.ports[0].postMessage(!0));
      }
    });
  }
  /**
   * Apply the routing rules to a FetchEvent object to get a Response from an
   * appropriate Route's handler.
   *
   * @param {Object} options
   * @param {Request} options.request The request to handle.
   * @param {ExtendableEvent} options.event The event that triggered the
   *     request.
   * @return {Promise<Response>|undefined} A promise is returned if a
   *     registered route can handle the request. If there is no matching
   *     route and there's no `defaultHandler`, `undefined` is returned.
   */
  handleRequest({ request: e, event: t }) {
    const n = new URL(e.url, location.href);
    if (!n.protocol.startsWith("http"))
      return;
    const r = n.origin === location.origin, { params: c, route: a } = this.findMatchingRoute({
      event: t,
      request: e,
      sameOrigin: r,
      url: n
    });
    let i = a && a.handler;
    const o = e.method;
    if (!i && this._defaultHandlerMap.has(o) && (i = this._defaultHandlerMap.get(o)), !i)
      return;
    let l;
    try {
      l = i.handle({ url: n, request: e, event: t, params: c });
    } catch (u) {
      l = Promise.reject(u);
    }
    const p = a && a.catchHandler;
    return l instanceof Promise && (this._catchHandler || p) && (l = l.catch(async (u) => {
      if (p)
        try {
          return await p.handle({ url: n, request: e, event: t, params: c });
        } catch (N) {
          N instanceof Error && (u = N);
        }
      if (this._catchHandler)
        return this._catchHandler.handle({ url: n, request: e, event: t });
      throw u;
    })), l;
  }
  /**
   * Checks a request and URL (and optionally an event) against the list of
   * registered routes, and if there's a match, returns the corresponding
   * route along with any params generated by the match.
   *
   * @param {Object} options
   * @param {URL} options.url
   * @param {boolean} options.sameOrigin The result of comparing `url.origin`
   *     against the current origin.
   * @param {Request} options.request The request to match.
   * @param {Event} options.event The corresponding event.
   * @return {Object} An object with `route` and `params` properties.
   *     They are populated if a matching route was found or `undefined`
   *     otherwise.
   */
  findMatchingRoute({ url: e, sameOrigin: t, request: n, event: r }) {
    const c = this._routes.get(n.method) || [];
    for (const a of c) {
      let i;
      const o = a.match({ url: e, sameOrigin: t, request: n, event: r });
      if (o)
        return i = o, (Array.isArray(i) && i.length === 0 || o.constructor === Object && // eslint-disable-line
        Object.keys(o).length === 0 || typeof o == "boolean") && (i = void 0), { route: a, params: i };
    }
    return {};
  }
  /**
   * Define a default `handler` that's called when no routes explicitly
   * match the incoming request.
   *
   * Each HTTP method ('GET', 'POST', etc.) gets its own default handler.
   *
   * Without a default handler, unmatched requests will go against the
   * network as if there were no service worker present.
   *
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resulting in a Response.
   * @param {string} [method='GET'] The HTTP method to associate with this
   * default handler. Each method has its own default.
   */
  setDefaultHandler(e, t = F) {
    this._defaultHandlerMap.set(t, R(e));
  }
  /**
   * If a Route throws an error while handling a request, this `handler`
   * will be called and given a chance to provide a response.
   *
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resulting in a Response.
   */
  setCatchHandler(e) {
    this._catchHandler = R(e);
  }
  /**
   * Registers a route with the router.
   *
   * @param {workbox-routing.Route} route The route to register.
   */
  registerRoute(e) {
    this._routes.has(e.method) || this._routes.set(e.method, []), this._routes.get(e.method).push(e);
  }
  /**
   * Unregisters a route with the router.
   *
   * @param {workbox-routing.Route} route The route to unregister.
   */
  unregisterRoute(e) {
    if (!this._routes.has(e.method))
      throw new h("unregister-route-but-not-found-with-method", {
        method: e.method
      });
    const t = this._routes.get(e.method).indexOf(e);
    if (t > -1)
      this._routes.get(e.method).splice(t, 1);
    else
      throw new h("unregister-route-route-not-registered");
  }
}
let g;
const E = () => (g || (g = new Q(), g.addFetchListener(), g.addCacheListener()), g);
function z(s, e, t) {
  let n;
  if (typeof s == "string") {
    const c = new URL(s, location.href), a = ({ url: i }) => i.href === c.href;
    n = new b(a, e, t);
  } else if (s instanceof RegExp)
    n = new V(s, e, t);
  else if (typeof s == "function")
    n = new b(s, e, t);
  else if (s instanceof b)
    n = s;
  else
    throw new h("unsupported-route-type", {
      moduleName: "workbox-routing",
      funcName: "registerRoute",
      paramName: "capture"
    });
  return E().registerRoute(n), n;
}
try {
  self["workbox:strategies:7.0.0"] && _();
} catch {
}
const j = {
  /**
   * Returns a valid response (to allow caching) if the status is 200 (OK) or
   * 0 (opaque).
   *
   * @param {Object} options
   * @param {Response} options.response
   * @return {Response|null}
   *
   * @private
   */
  cacheWillUpdate: async ({ response: s }) => s.status === 200 || s.status === 0 ? s : null
}, f = {
  googleAnalytics: "googleAnalytics",
  precache: "precache-v2",
  prefix: "workbox",
  runtime: "runtime",
  suffix: typeof registration < "u" ? registration.scope : ""
}, C = (s) => [f.prefix, s, f.suffix].filter((e) => e && e.length > 0).join("-"), J = (s) => {
  for (const e of Object.keys(f))
    s(e);
}, K = {
  updateDetails: (s) => {
    J((e) => {
      typeof s[e] == "string" && (f[e] = s[e]);
    });
  },
  getGoogleAnalyticsName: (s) => s || C(f.googleAnalytics),
  getPrecacheName: (s) => s || C(f.precache),
  getPrefix: () => f.prefix,
  getRuntimeName: (s) => s || C(f.runtime),
  getSuffix: () => f.suffix
};
function O(s, e) {
  const t = new URL(s);
  for (const n of e)
    t.searchParams.delete(n);
  return t.href;
}
async function X(s, e, t, n) {
  const r = O(e.url, t);
  if (e.url === r)
    return s.match(e, n);
  const c = Object.assign(Object.assign({}, n), { ignoreSearch: !0 }), a = await s.keys(e, c);
  for (const i of a) {
    const o = O(i.url, t);
    if (r === o)
      return s.match(i, n);
  }
}
class Y {
  /**
   * Creates a promise and exposes its resolve and reject functions as methods.
   */
  constructor() {
    this.promise = new Promise((e, t) => {
      this.resolve = e, this.reject = t;
    });
  }
}
const Z = /* @__PURE__ */ new Set();
async function ee() {
  for (const s of Z)
    await s();
}
function te(s) {
  return new Promise((e) => setTimeout(e, s));
}
function m(s) {
  return typeof s == "string" ? new Request(s) : s;
}
class se {
  /**
   * Creates a new instance associated with the passed strategy and event
   * that's handling the request.
   *
   * The constructor also initializes the state that will be passed to each of
   * the plugins handling this request.
   *
   * @param {workbox-strategies.Strategy} strategy
   * @param {Object} options
   * @param {Request|string} options.request A request to run this strategy for.
   * @param {ExtendableEvent} options.event The event associated with the
   *     request.
   * @param {URL} [options.url]
   * @param {*} [options.params] The return value from the
   *     {@link workbox-routing~matchCallback} (if applicable).
   */
  constructor(e, t) {
    this._cacheKeys = {}, Object.assign(this, t), this.event = t.event, this._strategy = e, this._handlerDeferred = new Y(), this._extendLifetimePromises = [], this._plugins = [...e.plugins], this._pluginStateMap = /* @__PURE__ */ new Map();
    for (const n of this._plugins)
      this._pluginStateMap.set(n, {});
    this.event.waitUntil(this._handlerDeferred.promise);
  }
  /**
   * Fetches a given request (and invokes any applicable plugin callback
   * methods) using the `fetchOptions` (for non-navigation requests) and
   * `plugins` defined on the `Strategy` object.
   *
   * The following plugin lifecycle methods are invoked when using this method:
   * - `requestWillFetch()`
   * - `fetchDidSucceed()`
   * - `fetchDidFail()`
   *
   * @param {Request|string} input The URL or request to fetch.
   * @return {Promise<Response>}
   */
  async fetch(e) {
    const { event: t } = this;
    let n = m(e);
    if (n.mode === "navigate" && t instanceof FetchEvent && t.preloadResponse) {
      const a = await t.preloadResponse;
      if (a)
        return a;
    }
    const r = this.hasCallback("fetchDidFail") ? n.clone() : null;
    try {
      for (const a of this.iterateCallbacks("requestWillFetch"))
        n = await a({ request: n.clone(), event: t });
    } catch (a) {
      if (a instanceof Error)
        throw new h("plugin-error-request-will-fetch", {
          thrownErrorMessage: a.message
        });
    }
    const c = n.clone();
    try {
      let a;
      a = await fetch(n, n.mode === "navigate" ? void 0 : this._strategy.fetchOptions);
      for (const i of this.iterateCallbacks("fetchDidSucceed"))
        a = await i({
          event: t,
          request: c,
          response: a
        });
      return a;
    } catch (a) {
      throw r && await this.runCallbacks("fetchDidFail", {
        error: a,
        event: t,
        originalRequest: r.clone(),
        request: c.clone()
      }), a;
    }
  }
  /**
   * Calls `this.fetch()` and (in the background) runs `this.cachePut()` on
   * the response generated by `this.fetch()`.
   *
   * The call to `this.cachePut()` automatically invokes `this.waitUntil()`,
   * so you do not have to manually call `waitUntil()` on the event.
   *
   * @param {Request|string} input The request or URL to fetch and cache.
   * @return {Promise<Response>}
   */
  async fetchAndCachePut(e) {
    const t = await this.fetch(e), n = t.clone();
    return this.waitUntil(this.cachePut(e, n)), t;
  }
  /**
   * Matches a request from the cache (and invokes any applicable plugin
   * callback methods) using the `cacheName`, `matchOptions`, and `plugins`
   * defined on the strategy object.
   *
   * The following plugin lifecycle methods are invoked when using this method:
   * - cacheKeyWillByUsed()
   * - cachedResponseWillByUsed()
   *
   * @param {Request|string} key The Request or URL to use as the cache key.
   * @return {Promise<Response|undefined>} A matching response, if found.
   */
  async cacheMatch(e) {
    const t = m(e);
    let n;
    const { cacheName: r, matchOptions: c } = this._strategy, a = await this.getCacheKey(t, "read"), i = Object.assign(Object.assign({}, c), { cacheName: r });
    n = await caches.match(a, i);
    for (const o of this.iterateCallbacks("cachedResponseWillBeUsed"))
      n = await o({
        cacheName: r,
        matchOptions: c,
        cachedResponse: n,
        request: a,
        event: this.event
      }) || void 0;
    return n;
  }
  /**
   * Puts a request/response pair in the cache (and invokes any applicable
   * plugin callback methods) using the `cacheName` and `plugins` defined on
   * the strategy object.
   *
   * The following plugin lifecycle methods are invoked when using this method:
   * - cacheKeyWillByUsed()
   * - cacheWillUpdate()
   * - cacheDidUpdate()
   *
   * @param {Request|string} key The request or URL to use as the cache key.
   * @param {Response} response The response to cache.
   * @return {Promise<boolean>} `false` if a cacheWillUpdate caused the response
   * not be cached, and `true` otherwise.
   */
  async cachePut(e, t) {
    const n = m(e);
    await te(0);
    const r = await this.getCacheKey(n, "write");
    if (!t)
      throw new h("cache-put-with-no-response", {
        url: G(r.url)
      });
    const c = await this._ensureResponseSafeToCache(t);
    if (!c)
      return !1;
    const { cacheName: a, matchOptions: i } = this._strategy, o = await self.caches.open(a), l = this.hasCallback("cacheDidUpdate"), p = l ? await X(
      // TODO(philipwalton): the `__WB_REVISION__` param is a precaching
      // feature. Consider into ways to only add this behavior if using
      // precaching.
      o,
      r.clone(),
      ["__WB_REVISION__"],
      i
    ) : null;
    try {
      await o.put(r, l ? c.clone() : c);
    } catch (u) {
      if (u instanceof Error)
        throw u.name === "QuotaExceededError" && await ee(), u;
    }
    for (const u of this.iterateCallbacks("cacheDidUpdate"))
      await u({
        cacheName: a,
        oldResponse: p,
        newResponse: c.clone(),
        request: r,
        event: this.event
      });
    return !0;
  }
  /**
   * Checks the list of plugins for the `cacheKeyWillBeUsed` callback, and
   * executes any of those callbacks found in sequence. The final `Request`
   * object returned by the last plugin is treated as the cache key for cache
   * reads and/or writes. If no `cacheKeyWillBeUsed` plugin callbacks have
   * been registered, the passed request is returned unmodified
   *
   * @param {Request} request
   * @param {string} mode
   * @return {Promise<Request>}
   */
  async getCacheKey(e, t) {
    const n = `${e.url} | ${t}`;
    if (!this._cacheKeys[n]) {
      let r = e;
      for (const c of this.iterateCallbacks("cacheKeyWillBeUsed"))
        r = m(await c({
          mode: t,
          request: r,
          event: this.event,
          // params has a type any can't change right now.
          params: this.params
          // eslint-disable-line
        }));
      this._cacheKeys[n] = r;
    }
    return this._cacheKeys[n];
  }
  /**
   * Returns true if the strategy has at least one plugin with the given
   * callback.
   *
   * @param {string} name The name of the callback to check for.
   * @return {boolean}
   */
  hasCallback(e) {
    for (const t of this._strategy.plugins)
      if (e in t)
        return !0;
    return !1;
  }
  /**
   * Runs all plugin callbacks matching the given name, in order, passing the
   * given param object (merged ith the current plugin state) as the only
   * argument.
   *
   * Note: since this method runs all plugins, it's not suitable for cases
   * where the return value of a callback needs to be applied prior to calling
   * the next callback. See
   * {@link workbox-strategies.StrategyHandler#iterateCallbacks}
   * below for how to handle that case.
   *
   * @param {string} name The name of the callback to run within each plugin.
   * @param {Object} param The object to pass as the first (and only) param
   *     when executing each callback. This object will be merged with the
   *     current plugin state prior to callback execution.
   */
  async runCallbacks(e, t) {
    for (const n of this.iterateCallbacks(e))
      await n(t);
  }
  /**
   * Accepts a callback and returns an iterable of matching plugin callbacks,
   * where each callback is wrapped with the current handler state (i.e. when
   * you call each callback, whatever object parameter you pass it will
   * be merged with the plugin's current state).
   *
   * @param {string} name The name fo the callback to run
   * @return {Array<Function>}
   */
  *iterateCallbacks(e) {
    for (const t of this._strategy.plugins)
      if (typeof t[e] == "function") {
        const n = this._pluginStateMap.get(t);
        yield (c) => {
          const a = Object.assign(Object.assign({}, c), { state: n });
          return t[e](a);
        };
      }
  }
  /**
   * Adds a promise to the
   * [extend lifetime promises]{@link https://w3c.github.io/ServiceWorker/#extendableevent-extend-lifetime-promises}
   * of the event event associated with the request being handled (usually a
   * `FetchEvent`).
   *
   * Note: you can await
   * {@link workbox-strategies.StrategyHandler~doneWaiting}
   * to know when all added promises have settled.
   *
   * @param {Promise} promise A promise to add to the extend lifetime promises
   *     of the event that triggered the request.
   */
  waitUntil(e) {
    return this._extendLifetimePromises.push(e), e;
  }
  /**
   * Returns a promise that resolves once all promises passed to
   * {@link workbox-strategies.StrategyHandler~waitUntil}
   * have settled.
   *
   * Note: any work done after `doneWaiting()` settles should be manually
   * passed to an event's `waitUntil()` method (not this handler's
   * `waitUntil()` method), otherwise the service worker thread my be killed
   * prior to your work completing.
   */
  async doneWaiting() {
    let e;
    for (; e = this._extendLifetimePromises.shift(); )
      await e;
  }
  /**
   * Stops running the strategy and immediately resolves any pending
   * `waitUntil()` promises.
   */
  destroy() {
    this._handlerDeferred.resolve(null);
  }
  /**
   * This method will call cacheWillUpdate on the available plugins (or use
   * status === 200) to determine if the Response is safe and valid to cache.
   *
   * @param {Request} options.request
   * @param {Response} options.response
   * @return {Promise<Response|undefined>}
   *
   * @private
   */
  async _ensureResponseSafeToCache(e) {
    let t = e, n = !1;
    for (const r of this.iterateCallbacks("cacheWillUpdate"))
      if (t = await r({
        request: this.request,
        response: t,
        event: this.event
      }) || void 0, n = !0, !t)
        break;
    return n || t && t.status !== 200 && (t = void 0), t;
  }
}
class M {
  /**
   * Creates a new instance of the strategy and sets all documented option
   * properties as public instance properties.
   *
   * Note: if a custom strategy class extends the base Strategy class and does
   * not need more than these properties, it does not need to define its own
   * constructor.
   *
   * @param {Object} [options]
   * @param {string} [options.cacheName] Cache name to store and retrieve
   * requests. Defaults to the cache names provided by
   * {@link workbox-core.cacheNames}.
   * @param {Array<Object>} [options.plugins] [Plugins]{@link https://developers.google.com/web/tools/workbox/guides/using-plugins}
   * to use in conjunction with this caching strategy.
   * @param {Object} [options.fetchOptions] Values passed along to the
   * [`init`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters)
   * of [non-navigation](https://github.com/GoogleChrome/workbox/issues/1796)
   * `fetch()` requests made by this strategy.
   * @param {Object} [options.matchOptions] The
   * [`CacheQueryOptions`]{@link https://w3c.github.io/ServiceWorker/#dictdef-cachequeryoptions}
   * for any `cache.match()` or `cache.put()` calls made by this strategy.
   */
  constructor(e = {}) {
    this.cacheName = K.getRuntimeName(e.cacheName), this.plugins = e.plugins || [], this.fetchOptions = e.fetchOptions, this.matchOptions = e.matchOptions;
  }
  /**
   * Perform a request strategy and returns a `Promise` that will resolve with
   * a `Response`, invoking all relevant plugin callbacks.
   *
   * When a strategy instance is registered with a Workbox
   * {@link workbox-routing.Route}, this method is automatically
   * called when the route matches.
   *
   * Alternatively, this method can be used in a standalone `FetchEvent`
   * listener by passing it to `event.respondWith()`.
   *
   * @param {FetchEvent|Object} options A `FetchEvent` or an object with the
   *     properties listed below.
   * @param {Request|string} options.request A request to run this strategy for.
   * @param {ExtendableEvent} options.event The event associated with the
   *     request.
   * @param {URL} [options.url]
   * @param {*} [options.params]
   */
  handle(e) {
    const [t] = this.handleAll(e);
    return t;
  }
  /**
   * Similar to {@link workbox-strategies.Strategy~handle}, but
   * instead of just returning a `Promise` that resolves to a `Response` it
   * it will return an tuple of `[response, done]` promises, where the former
   * (`response`) is equivalent to what `handle()` returns, and the latter is a
   * Promise that will resolve once any promises that were added to
   * `event.waitUntil()` as part of performing the strategy have completed.
   *
   * You can await the `done` promise to ensure any extra work performed by
   * the strategy (usually caching responses) completes successfully.
   *
   * @param {FetchEvent|Object} options A `FetchEvent` or an object with the
   *     properties listed below.
   * @param {Request|string} options.request A request to run this strategy for.
   * @param {ExtendableEvent} options.event The event associated with the
   *     request.
   * @param {URL} [options.url]
   * @param {*} [options.params]
   * @return {Array<Promise>} A tuple of [response, done]
   *     promises that can be used to determine when the response resolves as
   *     well as when the handler has completed all its work.
   */
  handleAll(e) {
    e instanceof FetchEvent && (e = {
      event: e,
      request: e.request
    });
    const t = e.event, n = typeof e.request == "string" ? new Request(e.request) : e.request, r = "params" in e ? e.params : void 0, c = new se(this, { event: t, request: n, params: r }), a = this._getResponse(c, n, t), i = this._awaitComplete(a, c, n, t);
    return [a, i];
  }
  async _getResponse(e, t, n) {
    await e.runCallbacks("handlerWillStart", { event: n, request: t });
    let r;
    try {
      if (r = await this._handle(t, e), !r || r.type === "error")
        throw new h("no-response", { url: t.url });
    } catch (c) {
      if (c instanceof Error) {
        for (const a of e.iterateCallbacks("handlerDidError"))
          if (r = await a({ error: c, event: n, request: t }), r)
            break;
      }
      if (!r)
        throw c;
    }
    for (const c of e.iterateCallbacks("handlerWillRespond"))
      r = await c({ event: n, request: t, response: r });
    return r;
  }
  async _awaitComplete(e, t, n, r) {
    let c, a;
    try {
      c = await e;
    } catch {
    }
    try {
      await t.runCallbacks("handlerDidRespond", {
        event: r,
        request: n,
        response: c
      }), await t.doneWaiting();
    } catch (i) {
      i instanceof Error && (a = i);
    }
    if (await t.runCallbacks("handlerDidComplete", {
      event: r,
      request: n,
      response: c,
      error: a
    }), t.destroy(), a)
      throw a;
  }
}
class ne extends M {
  /**
   * @param {Object} [options]
   * @param {string} [options.cacheName] Cache name to store and retrieve
   * requests. Defaults to cache names provided by
   * {@link workbox-core.cacheNames}.
   * @param {Array<Object>} [options.plugins] [Plugins]{@link https://developers.google.com/web/tools/workbox/guides/using-plugins}
   * to use in conjunction with this caching strategy.
   * @param {Object} [options.fetchOptions] Values passed along to the
   * [`init`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters)
   * of [non-navigation](https://github.com/GoogleChrome/workbox/issues/1796)
   * `fetch()` requests made by this strategy.
   * @param {Object} [options.matchOptions] [`CacheQueryOptions`](https://w3c.github.io/ServiceWorker/#dictdef-cachequeryoptions)
   */
  constructor(e = {}) {
    super(e), this.plugins.some((t) => "cacheWillUpdate" in t) || this.plugins.unshift(j);
  }
  /**
   * @private
   * @param {Request|string} request A request to run this strategy for.
   * @param {workbox-strategies.StrategyHandler} handler The event that
   *     triggered the request.
   * @return {Promise<Response>}
   */
  async _handle(e, t) {
    const n = t.fetchAndCachePut(e).catch(() => {
    });
    t.waitUntil(n);
    let r = await t.cacheMatch(e), c;
    if (!r)
      try {
        r = await n;
      } catch (a) {
        a instanceof Error && (c = a);
      }
    if (!r)
      throw new h("no-response", { url: e.url, error: c });
    return r;
  }
}
try {
  self["workbox:cacheable-response:7.0.0"] && _();
} catch {
}
const re = (s, e) => e.some((t) => s instanceof t);
let v, S;
function ae() {
  return v || (v = [
    IDBDatabase,
    IDBObjectStore,
    IDBIndex,
    IDBCursor,
    IDBTransaction
  ]);
}
function ce() {
  return S || (S = [
    IDBCursor.prototype.advance,
    IDBCursor.prototype.continue,
    IDBCursor.prototype.continuePrimaryKey
  ]);
}
const B = /* @__PURE__ */ new WeakMap(), I = /* @__PURE__ */ new WeakMap(), H = /* @__PURE__ */ new WeakMap(), k = /* @__PURE__ */ new WeakMap(), D = /* @__PURE__ */ new WeakMap();
function ie(s) {
  const e = new Promise((t, n) => {
    const r = () => {
      s.removeEventListener("success", c), s.removeEventListener("error", a);
    }, c = () => {
      t(y(s.result)), r();
    }, a = () => {
      n(s.error), r();
    };
    s.addEventListener("success", c), s.addEventListener("error", a);
  });
  return e.then((t) => {
    t instanceof IDBCursor && B.set(t, s);
  }).catch(() => {
  }), D.set(e, s), e;
}
function oe(s) {
  if (I.has(s))
    return;
  const e = new Promise((t, n) => {
    const r = () => {
      s.removeEventListener("complete", c), s.removeEventListener("error", a), s.removeEventListener("abort", a);
    }, c = () => {
      t(), r();
    }, a = () => {
      n(s.error || new DOMException("AbortError", "AbortError")), r();
    };
    s.addEventListener("complete", c), s.addEventListener("error", a), s.addEventListener("abort", a);
  });
  I.set(s, e);
}
let x = {
  get(s, e, t) {
    if (s instanceof IDBTransaction) {
      if (e === "done")
        return I.get(s);
      if (e === "objectStoreNames")
        return s.objectStoreNames || H.get(s);
      if (e === "store")
        return t.objectStoreNames[1] ? void 0 : t.objectStore(t.objectStoreNames[0]);
    }
    return y(s[e]);
  },
  set(s, e, t) {
    return s[e] = t, !0;
  },
  has(s, e) {
    return s instanceof IDBTransaction && (e === "done" || e === "store") ? !0 : e in s;
  }
};
function le(s) {
  x = s(x);
}
function he(s) {
  return s === IDBDatabase.prototype.transaction && !("objectStoreNames" in IDBTransaction.prototype) ? function(e, ...t) {
    const n = s.call(P(this), e, ...t);
    return H.set(n, e.sort ? e.sort() : [e]), y(n);
  } : ce().includes(s) ? function(...e) {
    return s.apply(P(this), e), y(B.get(this));
  } : function(...e) {
    return y(s.apply(P(this), e));
  };
}
function ue(s) {
  return typeof s == "function" ? he(s) : (s instanceof IDBTransaction && oe(s), re(s, ae()) ? new Proxy(s, x) : s);
}
function y(s) {
  if (s instanceof IDBRequest)
    return ie(s);
  if (k.has(s))
    return k.get(s);
  const e = ue(s);
  return e !== s && (k.set(s, e), D.set(e, s)), e;
}
const P = (s) => D.get(s), fe = ["get", "getKey", "getAll", "getAllKeys", "count"], de = ["put", "add", "delete", "clear"], U = /* @__PURE__ */ new Map();
function A(s, e) {
  if (!(s instanceof IDBDatabase && !(e in s) && typeof e == "string"))
    return;
  if (U.get(e))
    return U.get(e);
  const t = e.replace(/FromIndex$/, ""), n = e !== t, r = de.includes(t);
  if (
    // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
    !(t in (n ? IDBIndex : IDBObjectStore).prototype) || !(r || fe.includes(t))
  )
    return;
  const c = async function(a, ...i) {
    const o = this.transaction(a, r ? "readwrite" : "readonly");
    let l = o.store;
    return n && (l = l.index(i.shift())), (await Promise.all([
      l[t](...i),
      r && o.done
    ]))[0];
  };
  return U.set(e, c), c;
}
le((s) => ({
  ...s,
  get: (e, t, n) => A(e, t) || s.get(e, t, n),
  has: (e, t) => !!A(e, t) || s.has(e, t)
}));
try {
  self["workbox:expiration:7.0.0"] && _();
} catch {
}
try {
  self["workbox:recipes:7.0.0"] && _();
} catch {
}
class pe extends M {
  /**
   * @param {Object} [options]
   * @param {string} [options.cacheName] Cache name to store and retrieve
   * requests. Defaults to cache names provided by
   * {@link workbox-core.cacheNames}.
   * @param {Array<Object>} [options.plugins] [Plugins]{@link https://developers.google.com/web/tools/workbox/guides/using-plugins}
   * to use in conjunction with this caching strategy.
   * @param {Object} [options.fetchOptions] Values passed along to the
   * [`init`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters)
   * of [non-navigation](https://github.com/GoogleChrome/workbox/issues/1796)
   * `fetch()` requests made by this strategy.
   * @param {Object} [options.matchOptions] [`CacheQueryOptions`](https://w3c.github.io/ServiceWorker/#dictdef-cachequeryoptions)
   * @param {number} [options.networkTimeoutSeconds] If set, any network requests
   * that fail to respond within the timeout will fallback to the cache.
   *
   * This option can be used to combat
   * "[lie-fi]{@link https://developers.google.com/web/fundamentals/performance/poor-connectivity/#lie-fi}"
   * scenarios.
   */
  constructor(e = {}) {
    super(e), this.plugins.some((t) => "cacheWillUpdate" in t) || this.plugins.unshift(j), this._networkTimeoutSeconds = e.networkTimeoutSeconds || 0;
  }
  /**
   * @private
   * @param {Request|string} request A request to run this strategy for.
   * @param {workbox-strategies.StrategyHandler} handler The event that
   *     triggered the request.
   * @return {Promise<Response>}
   */
  async _handle(e, t) {
    const n = [], r = [];
    let c;
    if (this._networkTimeoutSeconds) {
      const { id: o, promise: l } = this._getTimeoutPromise({ request: e, logs: n, handler: t });
      c = o, r.push(l);
    }
    const a = this._getNetworkPromise({
      timeoutId: c,
      request: e,
      logs: n,
      handler: t
    });
    r.push(a);
    const i = await t.waitUntil((async () => await t.waitUntil(Promise.race(r)) || // If Promise.race() resolved with null, it might be due to a network
    // timeout + a cache miss. If that were to happen, we'd rather wait until
    // the networkPromise resolves instead of returning null.
    // Note that it's fine to await an already-resolved promise, so we don't
    // have to check to see if it's still "in flight".
    await a)());
    if (!i)
      throw new h("no-response", { url: e.url });
    return i;
  }
  /**
   * @param {Object} options
   * @param {Request} options.request
   * @param {Array} options.logs A reference to the logs array
   * @param {Event} options.event
   * @return {Promise<Response>}
   *
   * @private
   */
  _getTimeoutPromise({ request: e, logs: t, handler: n }) {
    let r;
    return {
      promise: new Promise((a) => {
        r = setTimeout(async () => {
          a(await n.cacheMatch(e));
        }, this._networkTimeoutSeconds * 1e3);
      }),
      id: r
    };
  }
  /**
   * @param {Object} options
   * @param {number|undefined} options.timeoutId
   * @param {Request} options.request
   * @param {Array} options.logs A reference to the logs Array.
   * @param {Event} options.event
   * @return {Promise<Response>}
   *
   * @private
   */
  async _getNetworkPromise({ timeoutId: e, request: t, logs: n, handler: r }) {
    let c, a;
    try {
      a = await r.fetchAndCachePut(t);
    } catch (i) {
      i instanceof Error && (c = i);
    }
    return e && clearTimeout(e), (c || !a) && (a = await r.cacheMatch(t)), a;
  }
}
function ge(s) {
  E().setCatchHandler(s);
}
function W(s, e) {
  const t = e();
  return s.waitUntil(t), t;
}
try {
  self["workbox:precaching:7.0.0"] && _();
} catch {
}
const we = "__WB_REVISION__";
function ye(s) {
  if (!s)
    throw new h("add-to-cache-list-unexpected-type", { entry: s });
  if (typeof s == "string") {
    const c = new URL(s, location.href);
    return {
      cacheKey: c.href,
      url: c.href
    };
  }
  const { revision: e, url: t } = s;
  if (!t)
    throw new h("add-to-cache-list-unexpected-type", { entry: s });
  if (!e) {
    const c = new URL(t, location.href);
    return {
      cacheKey: c.href,
      url: c.href
    };
  }
  const n = new URL(t, location.href), r = new URL(t, location.href);
  return n.searchParams.set(we, e), {
    cacheKey: n.href,
    url: r.href
  };
}
class me {
  constructor() {
    this.updatedURLs = [], this.notUpdatedURLs = [], this.handlerWillStart = async ({ request: e, state: t }) => {
      t && (t.originalRequest = e);
    }, this.cachedResponseWillBeUsed = async ({ event: e, state: t, cachedResponse: n }) => {
      if (e.type === "install" && t && t.originalRequest && t.originalRequest instanceof Request) {
        const r = t.originalRequest.url;
        n ? this.notUpdatedURLs.push(r) : this.updatedURLs.push(r);
      }
      return n;
    };
  }
}
class be {
  constructor({ precacheController: e }) {
    this.cacheKeyWillBeUsed = async ({ request: t, params: n }) => {
      const r = (n == null ? void 0 : n.cacheKey) || this._precacheController.getCacheKeyForURL(t.url);
      return r ? new Request(r, { headers: t.headers }) : t;
    }, this._precacheController = e;
  }
}
let w;
function Re() {
  if (w === void 0) {
    const s = new Response("");
    if ("body" in s)
      try {
        new Response(s.body), w = !0;
      } catch {
        w = !1;
      }
    w = !1;
  }
  return w;
}
async function Ce(s, e) {
  let t = null;
  if (s.url && (t = new URL(s.url).origin), t !== self.location.origin)
    throw new h("cross-origin-copy-response", { origin: t });
  const n = s.clone(), r = {
    headers: new Headers(n.headers),
    status: n.status,
    statusText: n.statusText
  }, c = e ? e(r) : r, a = Re() ? n.body : await n.blob();
  return new Response(a, c);
}
class d extends M {
  /**
   *
   * @param {Object} [options]
   * @param {string} [options.cacheName] Cache name to store and retrieve
   * requests. Defaults to the cache names provided by
   * {@link workbox-core.cacheNames}.
   * @param {Array<Object>} [options.plugins] {@link https://developers.google.com/web/tools/workbox/guides/using-plugins|Plugins}
   * to use in conjunction with this caching strategy.
   * @param {Object} [options.fetchOptions] Values passed along to the
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters|init}
   * of all fetch() requests made by this strategy.
   * @param {Object} [options.matchOptions] The
   * {@link https://w3c.github.io/ServiceWorker/#dictdef-cachequeryoptions|CacheQueryOptions}
   * for any `cache.match()` or `cache.put()` calls made by this strategy.
   * @param {boolean} [options.fallbackToNetwork=true] Whether to attempt to
   * get the response from the network if there's a precache miss.
   */
  constructor(e = {}) {
    e.cacheName = K.getPrecacheName(e.cacheName), super(e), this._fallbackToNetwork = e.fallbackToNetwork !== !1, this.plugins.push(d.copyRedirectedCacheableResponsesPlugin);
  }
  /**
   * @private
   * @param {Request|string} request A request to run this strategy for.
   * @param {workbox-strategies.StrategyHandler} handler The event that
   *     triggered the request.
   * @return {Promise<Response>}
   */
  async _handle(e, t) {
    const n = await t.cacheMatch(e);
    return n || (t.event && t.event.type === "install" ? await this._handleInstall(e, t) : await this._handleFetch(e, t));
  }
  async _handleFetch(e, t) {
    let n;
    const r = t.params || {};
    if (this._fallbackToNetwork) {
      const c = r.integrity, a = e.integrity, i = !a || a === c;
      n = await t.fetch(new Request(e, {
        integrity: e.mode !== "no-cors" ? a || c : void 0
      })), c && i && e.mode !== "no-cors" && (this._useDefaultCacheabilityPluginIfNeeded(), await t.cachePut(e, n.clone()));
    } else
      throw new h("missing-precache-entry", {
        cacheName: this.cacheName,
        url: e.url
      });
    return n;
  }
  async _handleInstall(e, t) {
    this._useDefaultCacheabilityPluginIfNeeded();
    const n = await t.fetch(e);
    if (!await t.cachePut(e, n.clone()))
      throw new h("bad-precaching-response", {
        url: e.url,
        status: n.status
      });
    return n;
  }
  /**
   * This method is complex, as there a number of things to account for:
   *
   * The `plugins` array can be set at construction, and/or it might be added to
   * to at any time before the strategy is used.
   *
   * At the time the strategy is used (i.e. during an `install` event), there
   * needs to be at least one plugin that implements `cacheWillUpdate` in the
   * array, other than `copyRedirectedCacheableResponsesPlugin`.
   *
   * - If this method is called and there are no suitable `cacheWillUpdate`
   * plugins, we need to add `defaultPrecacheCacheabilityPlugin`.
   *
   * - If this method is called and there is exactly one `cacheWillUpdate`, then
   * we don't have to do anything (this might be a previously added
   * `defaultPrecacheCacheabilityPlugin`, or it might be a custom plugin).
   *
   * - If this method is called and there is more than one `cacheWillUpdate`,
   * then we need to check if one is `defaultPrecacheCacheabilityPlugin`. If so,
   * we need to remove it. (This situation is unlikely, but it could happen if
   * the strategy is used multiple times, the first without a `cacheWillUpdate`,
   * and then later on after manually adding a custom `cacheWillUpdate`.)
   *
   * See https://github.com/GoogleChrome/workbox/issues/2737 for more context.
   *
   * @private
   */
  _useDefaultCacheabilityPluginIfNeeded() {
    let e = null, t = 0;
    for (const [n, r] of this.plugins.entries())
      r !== d.copyRedirectedCacheableResponsesPlugin && (r === d.defaultPrecacheCacheabilityPlugin && (e = n), r.cacheWillUpdate && t++);
    t === 0 ? this.plugins.push(d.defaultPrecacheCacheabilityPlugin) : t > 1 && e !== null && this.plugins.splice(e, 1);
  }
}
d.defaultPrecacheCacheabilityPlugin = {
  async cacheWillUpdate({ response: s }) {
    return !s || s.status >= 400 ? null : s;
  }
};
d.copyRedirectedCacheableResponsesPlugin = {
  async cacheWillUpdate({ response: s }) {
    return s.redirected ? await Ce(s) : s;
  }
};
class _e {
  /**
   * Create a new PrecacheController.
   *
   * @param {Object} [options]
   * @param {string} [options.cacheName] The cache to use for precaching.
   * @param {string} [options.plugins] Plugins to use when precaching as well
   * as responding to fetch events for precached assets.
   * @param {boolean} [options.fallbackToNetwork=true] Whether to attempt to
   * get the response from the network if there's a precache miss.
   */
  constructor({ cacheName: e, plugins: t = [], fallbackToNetwork: n = !0 } = {}) {
    this._urlsToCacheKeys = /* @__PURE__ */ new Map(), this._urlsToCacheModes = /* @__PURE__ */ new Map(), this._cacheKeysToIntegrities = /* @__PURE__ */ new Map(), this._strategy = new d({
      cacheName: K.getPrecacheName(e),
      plugins: [
        ...t,
        new be({ precacheController: this })
      ],
      fallbackToNetwork: n
    }), this.install = this.install.bind(this), this.activate = this.activate.bind(this);
  }
  /**
   * @type {workbox-precaching.PrecacheStrategy} The strategy created by this controller and
   * used to cache assets and respond to fetch events.
   */
  get strategy() {
    return this._strategy;
  }
  /**
   * Adds items to the precache list, removing any duplicates and
   * stores the files in the
   * {@link workbox-core.cacheNames|"precache cache"} when the service
   * worker installs.
   *
   * This method can be called multiple times.
   *
   * @param {Array<Object|string>} [entries=[]] Array of entries to precache.
   */
  precache(e) {
    this.addToCacheList(e), this._installAndActiveListenersAdded || (self.addEventListener("install", this.install), self.addEventListener("activate", this.activate), this._installAndActiveListenersAdded = !0);
  }
  /**
   * This method will add items to the precache list, removing duplicates
   * and ensuring the information is valid.
   *
   * @param {Array<workbox-precaching.PrecacheController.PrecacheEntry|string>} entries
   *     Array of entries to precache.
   */
  addToCacheList(e) {
    const t = [];
    for (const n of e) {
      typeof n == "string" ? t.push(n) : n && n.revision === void 0 && t.push(n.url);
      const { cacheKey: r, url: c } = ye(n), a = typeof n != "string" && n.revision ? "reload" : "default";
      if (this._urlsToCacheKeys.has(c) && this._urlsToCacheKeys.get(c) !== r)
        throw new h("add-to-cache-list-conflicting-entries", {
          firstEntry: this._urlsToCacheKeys.get(c),
          secondEntry: r
        });
      if (typeof n != "string" && n.integrity) {
        if (this._cacheKeysToIntegrities.has(r) && this._cacheKeysToIntegrities.get(r) !== n.integrity)
          throw new h("add-to-cache-list-conflicting-integrities", {
            url: c
          });
        this._cacheKeysToIntegrities.set(r, n.integrity);
      }
      if (this._urlsToCacheKeys.set(c, r), this._urlsToCacheModes.set(c, a), t.length > 0) {
        const i = `Workbox is precaching URLs without revision info: ${t.join(", ")}
This is generally NOT safe. Learn more at https://bit.ly/wb-precache`;
        console.warn(i);
      }
    }
  }
  /**
   * Precaches new and updated assets. Call this method from the service worker
   * install event.
   *
   * Note: this method calls `event.waitUntil()` for you, so you do not need
   * to call it yourself in your event handlers.
   *
   * @param {ExtendableEvent} event
   * @return {Promise<workbox-precaching.InstallResult>}
   */
  install(e) {
    return W(e, async () => {
      const t = new me();
      this.strategy.plugins.push(t);
      for (const [c, a] of this._urlsToCacheKeys) {
        const i = this._cacheKeysToIntegrities.get(a), o = this._urlsToCacheModes.get(c), l = new Request(c, {
          integrity: i,
          cache: o,
          credentials: "same-origin"
        });
        await Promise.all(this.strategy.handleAll({
          params: { cacheKey: a },
          request: l,
          event: e
        }));
      }
      const { updatedURLs: n, notUpdatedURLs: r } = t;
      return { updatedURLs: n, notUpdatedURLs: r };
    });
  }
  /**
   * Deletes assets that are no longer present in the current precache manifest.
   * Call this method from the service worker activate event.
   *
   * Note: this method calls `event.waitUntil()` for you, so you do not need
   * to call it yourself in your event handlers.
   *
   * @param {ExtendableEvent} event
   * @return {Promise<workbox-precaching.CleanupResult>}
   */
  activate(e) {
    return W(e, async () => {
      const t = await self.caches.open(this.strategy.cacheName), n = await t.keys(), r = new Set(this._urlsToCacheKeys.values()), c = [];
      for (const a of n)
        r.has(a.url) || (await t.delete(a), c.push(a.url));
      return { deletedURLs: c };
    });
  }
  /**
   * Returns a mapping of a precached URL to the corresponding cache key, taking
   * into account the revision information for the URL.
   *
   * @return {Map<string, string>} A URL to cache key mapping.
   */
  getURLsToCacheKeys() {
    return this._urlsToCacheKeys;
  }
  /**
   * Returns a list of all the URLs that have been precached by the current
   * service worker.
   *
   * @return {Array<string>} The precached URLs.
   */
  getCachedURLs() {
    return [...this._urlsToCacheKeys.keys()];
  }
  /**
   * Returns the cache key used for storing a given URL. If that URL is
   * unversioned, like `/index.html', then the cache key will be the original
   * URL with a search parameter appended to it.
   *
   * @param {string} url A URL whose cache key you want to look up.
   * @return {string} The versioned URL that corresponds to a cache key
   * for the original URL, or undefined if that URL isn't precached.
   */
  getCacheKeyForURL(e) {
    const t = new URL(e, location.href);
    return this._urlsToCacheKeys.get(t.href);
  }
  /**
   * @param {string} url A cache key whose SRI you want to look up.
   * @return {string} The subresource integrity associated with the cache key,
   * or undefined if it's not set.
   */
  getIntegrityForCacheKey(e) {
    return this._cacheKeysToIntegrities.get(e);
  }
  /**
   * This acts as a drop-in replacement for
   * [`cache.match()`](https://developer.mozilla.org/en-US/docs/Web/API/Cache/match)
   * with the following differences:
   *
   * - It knows what the name of the precache is, and only checks in that cache.
   * - It allows you to pass in an "original" URL without versioning parameters,
   * and it will automatically look up the correct cache key for the currently
   * active revision of that URL.
   *
   * E.g., `matchPrecache('index.html')` will find the correct precached
   * response for the currently active service worker, even if the actual cache
   * key is `'/index.html?__WB_REVISION__=1234abcd'`.
   *
   * @param {string|Request} request The key (without revisioning parameters)
   * to look up in the precache.
   * @return {Promise<Response|undefined>}
   */
  async matchPrecache(e) {
    const t = e instanceof Request ? e.url : e, n = this.getCacheKeyForURL(t);
    if (n)
      return (await self.caches.open(this.strategy.cacheName)).match(n);
  }
  /**
   * Returns a function that looks up `url` in the precache (taking into
   * account revision information), and returns the corresponding `Response`.
   *
   * @param {string} url The precached URL which will be used to lookup the
   * `Response`.
   * @return {workbox-routing~handlerCallback}
   */
  createHandlerBoundToURL(e) {
    const t = this.getCacheKeyForURL(e);
    if (!t)
      throw new h("non-precached-url", { url: e });
    return (n) => (n.request = new Request(e), n.params = Object.assign({ cacheKey: t }, n.params), this.strategy.handle(n));
  }
}
let L;
const ke = () => (L || (L = new _e()), L);
function T(s) {
  return ke().matchPrecache(s);
}
function Pe(s = {}) {
  const e = s.pageFallback || "offline.html", t = s.imageFallback || !1, n = s.fontFallback || !1;
  self.addEventListener("install", (c) => {
    const a = [e];
    t && a.push(t), n && a.push(n), c.waitUntil(self.caches.open("workbox-offline-fallbacks").then((i) => i.addAll(a)));
  }), ge(async (c) => {
    const a = c.request.destination, i = await self.caches.open("workbox-offline-fallbacks");
    return a === "document" ? await T(e) || await i.match(e) || Response.error() : a === "image" && t !== !1 ? await T(t) || await i.match(t) || Response.error() : a === "font" && n !== !1 && (await T(n) || await i.match(n)) || Response.error();
  });
}
function Ue(s) {
  E().setDefaultHandler(s);
}
const Le = [{"revision":null,"url":"assets/index-4c91dc97.css"},{"revision":null,"url":"assets/index-82b17a69.js"},{"revision":null,"url":"assets/workbox-window.prod.es5-c46a1faa.js"},{"revision":"c93aef9c7b099c20d385ad04bf7ebd42","url":"index.html"},{"revision":"b5a23c5265868c4408a6c00464006bd9","url":"offline.html"},{"revision":"d714963bdcfbf8146489804fa260be01","url":"./images/pwa/icon-maskable.png"},{"revision":"786eaaba55a6b62ecaf32cde1bf26873","url":"./images/pwa/icon-72x72.png"},{"revision":"a5437727776908ffc3d7936b1b28161a","url":"./images/pwa/icon-96x96.png"},{"revision":"abb293e81af9411c28587b747a3e76aa","url":"./images/pwa/icon-128x128.png"},{"revision":"9024e4ee398281b05e092bffd80c9642","url":"./images/pwa/icon-144x144.png"},{"revision":"a67f953bad219821ed6ef2eef8df5ca1","url":"./images/pwa/icon-152x152.png"},{"revision":"18d9668e052ec0ccdb5c53ebf6c30f9a","url":"./images/pwa/icon-192x192.png"},{"revision":"48527e6afb57c06834b4c9ca575f9180","url":"./images/pwa/icon-384x384.png"},{"revision":"d714963bdcfbf8146489804fa260be01","url":"./images/pwa/icon-512x512.png"},{"revision":"282be12ad648c51d4d4bab4363491ea5","url":"manifest.webmanifest"}];
console.log(Le);
Ue(new ne());
z(({ url: s }) => s.host === "optc-db.github.io", new pe());
Pe({
  pageFallback: "./offline.html"
});
