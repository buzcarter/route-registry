/* jshint esnext:true */
var pathToRegexp = require('path-to-regexp');

const METHODS = ['all', 'get', 'post', 'put', 'delete'];
const RegExes = {
  SPACE: /\s/g,
  UNSAFE_CHARS: /[^a-z0-9\s]/gi
};
const Errors = {
  DUPLICATE_ROUTE: 'Route with name "%s" exists'
};

var link = {};
var registry = {};
var routes = [];
var defaultMiddleware = [];

function use(fn) {
  defaultMiddleware.push(fn);
}

function keyToRegExp(key) {
  return new RegExp(':(' + key + ')(?:\\(([^\\(]+)\\))?');
}

function getLink(name, params) {
  var route = registry[name];
  var path = route && route.path;
  route.keys.map(function (key) {
    return key.name;
  });

  if (!path) {
    return;
  }

  if (params) {
    route.keys.forEach(function (key) {
      var opts = params[key.name];
      var value;

      if ('undefined' === typeof opts) {
        return;
      }

      value = ('object' === typeof opts ? opts.value : opts).toString();

      if (opts.lowercase) {
        value = value.toLowerCase();
      }
      if (opts.encode) {
        value = encodeURIComponent(value);
      }
      if (opts.strip) {
        value = value.replace(RegExes.UNSAFE_CHARS, '');
      }

      if ('undefined' === typeof opts.replaceSpaces || 'string' === typeof opts.replaceSpaces) {
        value = value.replace(RegExes.SPACE, opts.replaceSpaces || '-');
      }

      path = path.replace(keyToRegExp(key.name), value);
    });
  }

  return path;
}

function register(path, name) {
  if (registry[name]) {
    throw new Error(Errors.DUPLICATE_ROUTE.replace('%s', name));
  }

  var keys = [];
  var exp = pathToRegexp(path, keys);

  registry[name] = {
    path: path,
    keys: keys,
    regexp: exp
  };

  link[name] = function (params) {
    return getLink(name, params);
  };
}

function applyRoutes(app) {
  routes.forEach(function (route) {
    var method = route.shift();
    var path = route.shift();
    var properties = route.length > 1 && 'function' !== typeof route[0] ? route.shift() : null;
    var middleware = [];

    if (properties) {
      properties = 'object' === typeof properties ? properties : {
        name: properties
      };
      if (properties.name) {
        register(path, properties.name);
      }
      middleware.push(function (req, res, next) {
        res.locals.route = properties;
        for (var property in properties) {
          if (!req.route[property]) {
            req.route[property] = properties[property];
          }
        }
        next();
      });
    }

    middleware = middleware
      .concat(defaultMiddleware)
      .concat(route);

    app[method].apply(app, [path].concat(middleware));
  });
}

exports = {
  applyRoutes: applyRoutes,
  link: link,
  methods: METHODS,
  register: register,
  registry: registry,
  use: use
};

METHODS.forEach(function (method) {
  exports[method] = function () {
    var args = [method].concat(Array.prototype.slice.call(arguments));
    routes.push(args);
  };
});

module.exports = exports;
