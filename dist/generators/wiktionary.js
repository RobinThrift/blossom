'use strict';

var _toArray = require('babel-runtime/helpers/to-array')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.action = action;
exports.register = register;

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _lodash = require('lodash');

var config = {
    baseUrl: 'https://en.wiktionary.org/w/api.php'
};

var catPattern = /\[:(\S+?)\]/g;
function parseFormat(formatStr) {
    var categories = [],
        match = undefined;
    while ((match = catPattern.exec(formatStr)) !== null) {
        categories.push(match[1]);
    }
    return { formatStr: formatStr, categories: categories };
}

function buildRequestUrl(category) {
    var lang = arguments.length <= 1 || arguments[1] === undefined ? 'en' : arguments[1];

    return config.baseUrl + '?action=query&list=categorymembers&format=json&continue=&cmprop=title' + ('&cmlimit=500&cmsort=' + (0, _lodash.sample)(['timestamp', 'sortkey']) + '&cmtype=page') + ('&cmdir=' + (0, _lodash.sample)(['asc', 'desc', 'newer', 'older'])) + ('&cmtitle=Category:' + lang + ':' + (0, _lodash.capitalize)(category));
}

var whitespace = /\s+/g;
function findSuitableName(names) {
    var tries = 0;
    var name = (0, _lodash.sample)(names);
    while (whitespace.test(name) && tries < names.length) {
        name = (0, _lodash.sample)(names);
        tries++;
    }
    if (whitespace.test(name) || tries === names.length) {
        name = name.replace(whitespace, '_');
    }
    return name.toLowerCase();
}

function makeApiCall(category) {
    var deferred = _q2['default'].defer();
    (0, _request2['default'])(buildRequestUrl(category), function (err, resp, body) {
        if (err) {
            return deferred.reject(err);
        }
        if (resp.statusCode !== 200) {
            return deferred.reject(err);
        }
        try {
            var data = JSON.parse(body);
            if (data.query.categorymembers.length > 0) {
                deferred.resolve(findSuitableName(data.query.categorymembers.map(function (page) {
                    return page.title;
                })));
            } else {
                deferred.reject(new Error('Could\'t find enough words to fill the format.'));
            }
        } catch (e) {
            deferred.reject(e);
        }
    });
    return deferred.promise;
}

function resolveCategories(_ref) {
    var _ref2 = _toArray(_ref);

    var category = _ref2[0];

    var rest = _ref2.slice(1);

    if (rest.length === 0) {
        return [makeApiCall(category)];
    } else {
        return [makeApiCall(category)].concat(resolveCategories(rest));
    }
}

var findNames = /(\[:\S+?\])/;
function replaceNames(format, names) {
    var name = format,
        i = 0;

    while (findNames.test(name)) {
        name = name.replace(findNames, names[i]);
        i++;
    }

    return name;
}

function action(format) {
    var deferred = _q2['default'].defer();

    var _parseFormat = parseFormat(format);

    var categories = _parseFormat.categories;

    if (categories.length === 0) {
        deferred.resolve(format);
    } else {
        _q2['default'].all(resolveCategories(categories)).then(function (names) {
            deferred.resolve(replaceNames(format, names));
        }, deferred.reject);
    }

    return deferred.promise;
}

function register(program, stdout, stderr) {
    program.command('wiktionary <format>').option('-n, --count <n>', 'Number of names to generate', 1).alias('wk').action(function (format, options) {
        var proms = [];
        for (var i = 1; i <= options.count; i++) {
            proms.push(action(format));
        }

        _q2['default'].all(proms).done(function (names) {
            stdout(names.join('\n'));
        }, function (err) {
            stderr(err);
        });
    });

    return {
        name: 'wiktionary',
        help: '\t-f <FORMAT>:\t Can be any number of Alphanumeric characters plus _-.\n                \t [:name] will be understood as the word category "name" and will be resolved with wiktionary.\n                \t Please check https://www.wiktionary.org/ if the category exits.\n\n\t-n, --count:\t Will produce n code names'
    };
}

;