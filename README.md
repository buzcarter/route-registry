# Route-Registry

Parses a JSON config file into valid Express route handlers and URI path builder.

Each row, each "route", includes standard Express-ready path which may contain Regular Expressions, and one or more HTTP protocol handlers, to be executed should the path match.

### Intallation

```sh
npm install route-registry --save
```

### Example

```json
{
    "homepage": { "path": "/", "get": "home.index", "post": "homeIndex" },
    "blogger": { "path": "/authors/:name-:id(\\d+)", "get": "bloggerBio" },
    "photoGallery": { "path": "/photos/:name-:id(\\d+)", "get": "photoGallery" },
    "photoGalleryPhoto": { "path": "/photos/:name-:id(\\d+)/photo/:photoNumber(\\d+)", "get": "photoGalleryPhoto" },
}
```

