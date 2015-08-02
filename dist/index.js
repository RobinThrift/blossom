'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports['default'] = main;

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _package = require('../package');

var _package2 = _interopRequireDefault(_package);

var _lodash = require('lodash');

function versionCommand(program, stdout) {
    program.command('version').action(function () {
        stdout((0, _lodash.capitalize)(_package2['default'].name) + ' - version: ' + _package2['default'].version);
    });
}

function printHelp(info, stdout) {
    stdout(info.map(function (generator) {
        return '[' + generator.name.toUpperCase() + ']\n' + generator.help;
    }).join('\n'));
}

function main(args, generators) {
    versionCommand(_commander2['default'], console.log);

    var info = generators.map(function (generator) {
        return generator.register(_commander2['default'], console.log, console.error);
    });

    _commander2['default'].on('--help', function () {
        printHelp(info, console.log);
    });

    _commander2['default'].command('help').action(function () {
        printHelp(info, console.log);
    });

    if (args.slice(2).length === 0) {
        printHelp(info, console.log);
    } else {
        _commander2['default'].parse(args);
    }
}

module.exports = exports['default'];