/* jshint esnext:true */
/* global describe, it */
'use strict';

var routeRegistry = require('../lib/routeRegistry');
const assert = require('assert');

const RoutesConfig = {
  blogPost: {
    path: 'http://www.mydomainname.com/:title-:id/article',
    get: 'noop'
  },
  relativeBlogPost: {
    path: '/:title_:id(\\d+)/article'
  },
  blogPostsPager: {
    path: '/my-articles/:hub/overview/another-folder/:page(\\d+)'
  },
  videoPlaylistVideoThemed: {
    path: '/videos/:theme(action|comedy|family|nature)/:playlistName-:playlistId(\\d+)/:videoTitle-:videoId(\\d+)'
  },
  noKeys: {
    path: '/pizza/neat'
  },
  invalidKays: {
    path: '/:/:'
  }
};

var FORCE_UNDEFINED;

const LinkTests = [{
  routeName: 'blogPost',
  params: {
    title: 'pickles-mcgee',
    id: 90003
  },
  expected: 'http://www.mydomainname.com/pickles-mcgee-90003/article',
  description: 'Basic, safe'
}, {
  routeName: 'blogPost',
  params: {
    title_: 'superman-is-lame_',
    id: 90004
  },
  expected: 'http://www.mydomainname.com/:title-90004/article',
  description: 'Param with underscore suffix'
}, {
  routeName: 'relativeBlogPost',
  params: {
    title_: 'star-wars:revenge-inator',
    id: 8003
  },
  expected: '/star-wars:revenge-inator8003/article',
  description: 'Parsing param names with underscore'
}, {
  routeName: 'blogPostsPager',
  params: {
    hub: 'family',
    id: 500444,
    title: 'do-not-use'
  },
  expected: '/my-articles/family/overview/another-folder/:page',
  description: 'Extra and missing params'
}, {
  routeName: 'videoPlaylistVideoThemed',
  params: {
    theme: null,
    playlistName: FORCE_UNDEFINED,
    playlistId: [],
    videoTitle: {},
    videoId: new Date()
  },
  expected: '/videos/:theme/:playlistName-:playlistId/:videoTitle-:videoId',
  description: 'Incorrect param data types'
}, {
  routeName: 'noKeys',
  params: {
    a: 'superman-is-lame_',
    b: 183002,
    c: [],
    d: {},
    e: new Date()
  },
  expected: '/pizza/neat',
  description: 'No Keys in path definition'
}, {
  routeName: 'blogPost',
  params: {
    title: 'superman:identity-challenged:idealogue-man:idefinite',
    id: 40044
  },
  expected: 'http://www.mydomainname.com/superman:identity-challenged:idealogue-man:idefinite-40044/article',
  description: 'Multiple possible ":id" param matches within title'
}, {
  routeName: 'invalidKays',
  params: {
    ':': 'unexpected'
  },
  expected: '/:/:',
  description: 'Failed cookies'
}];

for (var routeName in RoutesConfig) {
  if (RoutesConfig.hasOwnProperty(routeName)) {
    routeRegistry.register(RoutesConfig[routeName].path, routeName);
  }
}

describe('Link Building: ', function () {
  LinkTests.forEach(function (value) {
    it(value.description + ' (route: ' + value.routeName + ')', function () {
      assert.equal(routeRegistry.link[value.routeName](value.params), value.expected);
    });
  });
});
