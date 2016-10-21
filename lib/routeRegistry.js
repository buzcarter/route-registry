/* jshint esnext:true */
var pathToRegexp = require('path-to-regexp');

const METHODS = ['all', 'get', 'post', 'put', 'delete'];
const RegExes = {
  KEY: /:(\w+)(?:\(([^\(]+)\))?/,
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

function toValue(opts, value) {
  if (value === null || typeof value === 'undefined') {
    return '';
  }

  var result = value.toString();
  if (opts.lowercase) {
    result = result.toLowerCase();
  }

  if (opts.encode) {
    result = encodeURIComponent(result);
  }

  if (opts.strip) {
    result = result.replace(RegExes.UNSAFE_CHARS, '');
  }

  if (typeof opts.replaceSpaces === 'undefined' || typeof opts.replaceSpaces === 'string') {
    result = result.replace(RegExes.SPACE, opts.replaceSpaces || '-');
  }

  return result;
}

function getLink(name, params) {
  var route = registry[name];

  if (!route || !route.pathTokens) {
    return '';
  }

  if (!params) {
    return '';
  }

  var result = '';

  route.pathTokens.forEach(function (data) {
    if (data.literal) {
      result += data.literal || '';
    } else {
      var opts = params[data.key];
      if (typeof opts === 'undefined' || opts === null) {
        result += ':' + data.key;
      } else {
        result += toValue(opts, typeof opts === 'object' ? opts.value : opts) || (':' + data.key);
      }
    }
  });

  return result;
}

function tokenizePath(path) {
  var result = [];
  var matches = true;
  var stringLiteral = '';

  while (path.length && matches) {
    matches = path.match(RegExes.KEY);
    stringLiteral = matches ? path.substr(0, matches.index) : path;

    if (stringLiteral) {
      result.push({
        literal: stringLiteral
      });
    }

    if (!matches) {
      path = '';
    } else {
      result.push({
        key: matches[1]
      });
      path = path.substring(matches.index + matches[0].length);
    }
  }

  return result;
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
    regexp: exp,
    pathTokens: tokenizePath(path)
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
