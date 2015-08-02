'use strict';

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.loadGenerators = loadGenerators;

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

var _path = require('path');

var _fs = require('fs');

var readDir = _q2['default'].denodeify(_fs.readdir);

function loadGenerators() {
    var dirPath = (0, _path.join)(__dirname, 'generators');
    return _q2['default'].async(_regeneratorRuntime.mark(function callee$1$0() {
        var generators;
        return _regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    context$2$0.next = 2;
                    return readDir(dirPath);

                case 2:
                    generators = context$2$0.sent;
                    return context$2$0.abrupt('return', generators.map(function (filename) {
                        return require((0, _path.join)(__dirname, 'generators', filename));
                    }));

                case 4:
                case 'end':
                    return context$2$0.stop();
            }
        }, callee$1$0, this);
    }))();
}