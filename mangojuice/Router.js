// @flow
import type { InitSharedProps, InitModel } from './types';
import createHistory from 'history/createBrowserHistory'
import fromPairs from 'lodash/fromPairs';
import UrlPattern from  'url-pattern';
import qs from 'qs';
import { Cmd } from './index';
import { nextId } from './utils';


export type Model = {
  params: { [key: string]: string },
  query: { [key: string]: string },
  active: { [key: string]: bool },
  appearedOnce: { [key: string]: bool },
  changedRoutes: { [key: string]: bool },
  firstTime: Function,
  changed: Function,
  switch: Function
};

export const Commands = Cmd.debug({
  UpdateRoute: Cmd.update((props, newModel) => newModel)
});

export const init = ({ nest }: InitSharedProps, routes): InitModel<Model> => {
  return {
    bindCommands: [ Commands, ...Object.values(routes) ],
    port: createHistoryHandler(routes),
    model: {
      params: {},
      query: {},
      active: {},
      appearedOnce: {},
      changedRoutes: {},
      firstTime(routeCmd) { return this.appearedOnce[routeCmd.routeId]; },
      changed(routeCmd) { return this.changedRoutes[routeCmd.routeId]; },
      is(routeCmd) { return this.active[routeCmd.routeId]; },
      when(routeCmd, fn) { return (this.is(routeCmd) && fn()) || null; },
      notFound(fn) { return (Object.keys(this.active).length === 0 && fn()) || null; }
    }
  };
};


export const route = (pattern, children, options) => {
  const routeId = nextId();
  const routeCmd = Cmd.update(handleRouteChange.bind(null, routeId));
  routeCmd.pattern = pattern;
  routeCmd.routeId = routeId;
  routeCmd.options = options;
  routeCmd.children = children;
  routeCmd.name = `Route: ${pattern}`;
  return routeCmd;
};


const createHistoryHandler = (routes) => {
  return ({ model, exec, meta }) => {
    meta.history = createHistory();
    meta.routesParents = {};
    meta.routesChildren = {};
    meta.routesMap = {};

    const fillObjects = (routesObj, parentId) => {
      if (!routesObj) {
        return [];
      }
      return Object.values(routesObj).map(r => {
        const suffix = r.children ? '(/*)' : '';
        const matcher = new UrlPattern(r.pattern + suffix);
        meta.routesMap[r.routeId] = matcher;
        meta.routesChildren[r.routeId] = fillObjects(r.children, r.routeId);
        meta.routesParents[r.routeId] = parentId;
        return r.routeId;
      });
    };
    fillObjects(routes.Routes);

    const findPath = (routeId, path) => {
      const res = meta.routesMap[routeId].match(path);
      if (!res) {
        return null;
      } else {
        const children = meta.routesChildren[routeId];
        if (children.length > 0) {
          let childRoute, childRes;
          for (let i = 0; i < children.length; i++) {
            const maybeChildRes = findPath(children[i], `/${res._}`);
            if (maybeChildRes) {
              childRoute = children[i];
              childRes = maybeChildRes;
              break;
            }
          }
          if (!childRoute) {
            return null;
          } else {
            return {
              params: Object.assign({}, childRes.params, res, { _: undefined }),
              chain: [ routeId, ...childRes.chain ]
            }
          }
        } else {
          return {
            params: res,
            chain: [ routeId ]
          };
        }
      }
    };

    const rootRoutes = Object.values(routes.Routes);
    const handleHistoryChange = (location) => {
      const paths = rootRoutes
        .map(x => findPath(x.routeId, location.pathname))
        .filter(x => x);
      const firstPath = paths[0];
      if (!firstPath) return;

      const active = {};
      const changedRoutes = {};
      const appearedOnce = Object.assign({}, model.appearedOnce);
      firstPath.chain.forEach(x => {
        active[x] = true;
        changedRoutes[x] = true; // TODO it is too naive
        if (appearedOnce[x] === undefined) {
          appearedOnce[x] = true;
        } else if (appearedOnce[x] === true) {
          appearedOnce[x] = false;
        }
      });

      const newModel = {
        params: firstPath.params,
        query: qs.parse(location.search),
        active,
        changedRoutes,
        appearedOnce,
      };

      exec(Commands.UpdateRoute, newModel);
    }

    const defaultRoute = rootRoutes.find(x => x.options.default);
    if (defaultRoute && meta.history.location.pathname === '/') {
      meta.history.replace(defaultRoute.pattern);
    }

    meta.history.listen(handleHistoryChange);
    handleHistoryChange(meta.history.location);
  };
};

function handleRouteChange(routeId, { model, meta }, newParams) {
  const routesChain = [meta.routesMap[routeId]];
  let currRouteId = routeId;
  while(meta.routesParents[currRouteId]) {
    currRouteId = meta.routesParents[currRouteId];
    routesChain.unshift(meta.routesMap[currRouteId]);
  }

  const nextParams = Object.assign({}, model.params, newParams);
  const nextUrl = routesChain.reduce((acc, routeMatcher) => {
    return acc + routeMatcher.stringify(nextParams);
  }, '');

  meta.history.push(nextUrl);
};
