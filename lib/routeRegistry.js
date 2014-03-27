var Route = require('express').Route,
	methods = ['all', 'get', 'post', 'put', 'delete'],
	keyMatch = /:(\w+)(?:\(([^\(]+)\))?/,
	unsafeCharacters = /[^a-z0-9\s]/gi,
	errors = {
		DUPLICATE_ROUTE: 'Route with name "%s" exists'
	},
	link = {},
	registry = {},
	routes = [],
	defaultMiddleware = [];

function use(fn) {
	defaultMiddleware.push(fn);
}

function getLink(name, params) {
	var	route = registry[name],
		path = route && route.path;

	if (!path) return;

	if (params) {
		route.keys.forEach(function (key) {
			var opts = params[key.name],
				value = 'object' === typeof opts ? opts.value : opts;

			if (opts) {
				if (opts.lowercase) value = value.toLowerCase();
				if (opts.encode) value = encodeURIComponent(value);
				if (opts.strip) value = value.replace(unsafeCharacters, '');
			}

			path = path.replace(keyMatch, value);
		});
	}

	return path.replace(/\s/g, '-');
}

function register(path, name) {
	if (registry[name]) throw new Error(errors.DUPLICATE_ROUTE.replace('%s', name));

	var route = new Route(null, path);

	registry[name] = {
		path: route.path,
		keys: route.keys,
		regexp: route.regexp
	};

	link[name] = function (params) {
		return getLink(name, params);
	};
}

function applyRoutes(app) {
	routes.forEach(function (route) {
		var method = route.shift(),
			path = route.shift(),
			properties = route.length > 1 && 'function' !== typeof route[0] ? route.shift() : null,
			middleware = [];

		if (properties) {
			properties = 'object' === typeof properties ? properties : { name: properties };
			if (properties.name) register(path, properties.name);
			middleware.push(function (req, res, next) {
				res.locals.route = properties;
				for (var property in properties) {
					if (!req.route[property]) req.route[property] = properties[property];
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
	methods: methods,
	register: register,
	registry: registry,
	use: use
};

methods.forEach(function (method) {
	exports[method] = function () {
		var args = [method].concat(Array.prototype.slice.call(arguments));
		routes.push(args);
	};
});

module.exports = exports;
