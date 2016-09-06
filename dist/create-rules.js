'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isNested = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _addPxToStyle = require('add-px-to-style');

var _addPxToStyle2 = _interopRequireDefault(_addPxToStyle);

var _commonDeclarations = require('./common-declarations');

var _commonDeclarations2 = _interopRequireDefault(_commonDeclarations);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var isNested = exports.isNested = function isNested(s) {
  return (/\s|:|^@|^\d|^from$|^to$/.test(s)
  );
};

var createRules = function createRules(name, style, parent) {
  // Extract nested rules
  var rules = createNestedRules(name, style, parent);

  if (!name) return rules;

  // Create styles array
  var styles = Object.keys(style).filter(function (key) {
    return style[key] !== null;
  }).filter(function (key) {
    return isArr(style[key]) || !isObj(style[key]);
  }).map(function (key) {
    return {
      key: key,
      prop: kebab(key),
      value: parseValue(key, style[key])
    };
  }).reduce(function (a, b) {
    return isArr(b.value) ? [].concat(_toConsumableArray(a), _toConsumableArray(b.value.map(function (v) {
      return _extends({}, b, { value: v });
    }))) : [].concat(_toConsumableArray(a), [b]);
  }, []);

  if (!isNested(name) && !parent) {
    // Extract common declarations as rules
    styles.reduce(reduceCommonRules(parent), []).forEach(function (r) {
      return rules.push(r);
    });
  }
  // Remove common declarations
  var filteredStyles = isNested(name) ? styles : styles.filter(filterCommonDeclarations);

  // Add base rule
  var selector = /^([0-9]|from|to)/.test(name) ? name : '.' + name;

  if (/^@keyframes/.test(parent)) {
    return [{
      id: name + parent,
      order: 3,
      selector: selector,
      css: createRuleset(selector, filteredStyles)
    }];
  }

  rules.unshift({
    id: name + (parent || ''),
    order: parent ? 2 : 1,
    selector: selector,
    css: createRuleset(selector, filteredStyles, parent)
  });

  return rules;
};

var createNestedRules = function createNestedRules(name, style, parent) {
  return Object.keys(style).filter(function (key) {
    return !!style[key];
  }).filter(function (key) {
    return !isArr(style[key]) && isObj(style[key]);
  }).map(function (key) {
    if (/^:/.test(key)) {
      return createRules(name + key, style[key], parent);
    } else if (/^@keyframes/.test(key)) {
      var subrules = createRules(null, style[key], key);
      return [{
        id: key,
        order: 3,
        selector: key,
        css: key + ' { ' + subrules.map(function (r) {
          return r.css;
        }).join('') + ' }'
      }];
    } else if (/^@/.test(key)) {
      return createRules(name, style[key], key);
    } else {
      var selector = name ? name + ' ' + key : key;
      return createRules(selector, style[key], parent);
    }
  }).reduce(function (a, b) {
    return a.concat(b);
  }, []);
};

var reduceCommonRules = function reduceCommonRules(parent) {
  return function (a, style) {
    var index = _commonDeclarations2.default[style.key] ? _commonDeclarations2.default[style.key].indexOf(style.value) : -1;
    if (index > -1) {
      var selector = '.cxs-' + style.prop + '-' + style.value;
      return [].concat(_toConsumableArray(a), [{
        id: selector,
        order: 0,
        selector: selector,
        css: createRuleset(selector, [style], parent)
      }]);
    } else {
      return a;
    }
  };
};

var filterCommonDeclarations = function filterCommonDeclarations(style) {
  return (_commonDeclarations2.default[style.key] ? _commonDeclarations2.default[style.key].indexOf(style.value) : -1) < 0;
};

var createRuleset = function createRuleset(selector, styles, parent) {
  var declarations = styles.map(function (s) {
    return s.prop + ':' + s.value;
  });
  var ruleset = selector + '{' + declarations.join(';') + '}';
  return parent ? parent + ' { ' + ruleset + ' }' : ruleset;
};

var isObj = function isObj(v) {
  return (typeof v === 'undefined' ? 'undefined' : _typeof(v)) === 'object';
};
var isArr = function isArr(v) {
  return Array.isArray(v);
};
var parseValue = function parseValue(prop, val) {
  return typeof val === 'number' ? (0, _addPxToStyle2.default)(prop, val) : val;
};
var kebab = function kebab(str) {
  return str.replace(/([A-Z]|^ms)/g, function (g) {
    return '-' + g.toLowerCase();
  });
};

exports.default = createRules;