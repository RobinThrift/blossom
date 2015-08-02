#!/usr/bin/env node
'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _utils = require('./utils');

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

(0, _utils.loadGenerators)().then(function (generators) {
    (0, _index2['default'])(process.argv, generators);
}, function (err) {
    console.error(err);
});