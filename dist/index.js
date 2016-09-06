'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.styleId = exports.options = exports.cache = exports.styleTag = undefined;

var _murmurhash3_gc = require('murmurhash-js/murmurhash3_gc');

var _murmurhash3_gc2 = _interopRequireDefault(_murmurhash3_gc);

var _lodash = require('lodash.debounce');

var _lodash2 = _interopRequireDefault(_lodash);

var _createRules = require('./create-rules');

var _createRules2 = _interopRequireDefault(_createRules);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var styleTag = exports.styleTag = null;
var cache = exports.cache = {};

var options = exports.options = {
  autoAttach: true,
  debounce: 0
};

var randomHex = function randomHex() {
  return Math.floor(Math.random() * 16777215).toString(16);
};
var styleId = exports.styleId = 'cxs-' + (0, _murmurhash3_gc2.default)(randomHex(), 128);

var cxs = function cxs(style) {
  var classNames = [];
  var hashname = 'cxs-' + (0, _murmurhash3_gc2.default)(JSON.stringify(style), 128);
  var rules = (0, _createRules2.default)(hashname, style);

  rules.forEach(function (r) {
    cache[r.id] = r;
  });

  rules.filter(function (r) {
    return !/:/.test(r.selector);
  }).filter(function (r) {
    return !/\s/.test(r.selector);
  }).forEach(function (r) {
    return classNames.push(r.selector.replace(/^\./, ''));
  });

  if (options.autoAttach) {
    cxs.attach();
  }
  return classNames.reduce(function (a, b) {
    if (a.indexOf(b) > -1) return a;
    return [].concat(_toConsumableArray(a), [b]);
  }, []).join(' ');
};

var attach = function attach() {
  if (typeof document === 'undefined') {
    // console.warn('Cannot attach stylesheet without a document')
    return;
  }

  var rules = cxs.rules;
  exports.styleTag = styleTag = styleTag || document.getElementById(styleId);

  if (styleTag === null) {
    exports.styleTag = styleTag = document.createElement('style');
    styleTag.id = styleId;
    document.head.appendChild(styleTag);
    cxs.sheet = styleTag.sheet;
  }

  // Insert all rules
  // note: filtering for new rules does not seem to have a huge performance impact
  // .filter(rule => [].slice.call(cxs.sheet.cssRules).map(r => r.selectorText).indexOf(rule.selector) < 0)
  rules.forEach(function (rule) {
    try {
      cxs.sheet.insertRule(rule.css, cxs.sheet.cssRules.length);
    } catch (e) {}
  });
};

cxs.attach = (0, _lodash2.default)(attach, options.debounce);

cxs.options = options;
cxs.clearCache = function () {
  exports.cache = cache = {};
};

Object.defineProperty(cxs, 'rules', {
  get: function get() {
    return Object.keys(cache || {}).map(function (k) {
      return cache[k] || false;
    }).filter(function (r) {
      return r.css.length;
    }).sort(function (a, b) {
      return a.order - b.order;
    });
  }
});

Object.defineProperty(cxs, 'css', {
  get: function get() {
    return cxs.rules.map(function (r) {
      return r.css;
    }).join('');
  }
});

exports.default = cxs;