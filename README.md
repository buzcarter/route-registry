# Route-Registry

Parses a JSON config file into valid Express route handlers and URI path builder.

Each row, each "route", includes standard Express-ready path which may contain Regular Expressions, and one or more HTTP protocol handlers, to be executed should the path match.

## Installation

```sh
npm install route-registry --save
```

## Examples

Initialize your register by adding routes (typically this would be an external JSON config file, but here we'll just use a JS variable):

```js
var routeRegistry = require('route-registry');

var RoutesConfig = {
    "homepage": { "path": "/", "get": "home.index", "post": "homeIndex" },
    "blogger": { "path": "/authors/:name-:id(\\d+)", "get": "bloggerBio" },
    "photoGallery": { "path": "/photos/:name-:id(\\d+)", "get": "photoGallery" },
    "photoGalleryPhoto": { "path": "/photos/:name-:id(\\d+)/photo/:photoNumber(\\d+)", "get": "photoGalleryPhoto" },
}

for (var routeName in RoutesConfig) {
  if (RoutesConfig.hasOwnProperty(routeName)) {
    routeRegistry.register(RoutesConfig[routeName].path, routeName);
  }
}
```

### Use As Link Builder

After initializing your registry you may use it within any file to generate links by calling the route as a method and passing a params object with values for each `:key`:

```js
var routeRegistry = require('route-registry');
var uri = routeRegistry.link.blogger({
        name: 'peter-parker',
        id: 20445
    });

console.log(uri);
```
