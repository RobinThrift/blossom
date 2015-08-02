
import Q from 'q';
import request from 'request';
import {sample, capitalize} from 'lodash';

const config = {
    baseUrl: 'https://en.wiktionary.org/w/api.php'
};


const catPattern = /\[:(\S+?)\]/g;
function parseFormat(formatStr) {
    let categories = [],
        match;
    while ((match = catPattern.exec(formatStr)) !== null) {
        categories.push(match[1]);
    }
    return {formatStr, categories};
}

function buildRequestUrl(category, lang = 'en') {
    return config.baseUrl
            + '?action=query&list=categorymembers&format=json&continue=&cmprop=title'
            + `&cmlimit=500&cmsort=${sample(['timestamp', 'sortkey'])}&cmtype=page`
            + `&cmdir=${sample(['asc', 'desc', 'newer', 'older'])}`
            + `&cmtitle=Category:${lang}:${capitalize(category)}`;
}

const whitespace = /\s+/g;
function findSuitableName(names) {
    let tries = 0;
    let name = sample(names);
    while(whitespace.test(name) && tries < names.length) {
        name = sample(names);
        tries++;
    }
    if (whitespace.test(name) || tries === names.length) {
        name = name.replace(whitespace, '_');
    }
    return name.toLowerCase();
}

function makeApiCall(category) {
    let deferred = Q.defer();
    request(buildRequestUrl(category), (err, resp, body) => {
        if (err) { return deferred.reject(err); }
        if (resp.statusCode !== 200) { return deferred.reject(err); }
        try {
            let data = JSON.parse(body);
            if (data.query.categorymembers.length > 0) {
                deferred.resolve(findSuitableName(data.query.categorymembers.map((page) => {
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

function resolveCategories([category, ...rest]) {
    if (rest.length === 0) {
        return [makeApiCall(category)];
    } else {
        return [makeApiCall(category)].concat(resolveCategories(rest));
    }
}

const findNames = /(\[:\S+?\])/;
function replaceNames(format, names) {
    let name = format,
        i = 0;

    while (findNames.test(name)) {
        name = name.replace(findNames, names[i]);
        i++;
    }

    return name;
}

export function action(format) {
    let deferred     = Q.defer(),
        {categories} = parseFormat(format);

    if (categories.length === 0) {
        deferred.resolve(format);
    } else {
        Q.all(resolveCategories(categories))
        .then((names) => {
            deferred.resolve(replaceNames(format, names));
        }, deferred.reject);
    }

    return deferred.promise;
}

export function register(program, stdout, stderr) {
    program
        .command('wiktionary <format>')
        .option('-n, --count <n>', 'Number of names to generate', 1)
        .alias('wk')
        .action((format, options) => {
            let proms = [];
            for (let i = 1; i <= options.count; i++) {
                proms.push(action(format));
            }

            Q.all(proms)
                .done((names) => {
                    stdout(names.join('\n'));
                }, (err) => {
                    stderr(err);
                });
        });

    return {
        name: 'wiktionary',
        help: `\t-f <FORMAT>:\t Can be any number of Alphanumeric characters plus _-.
                \t [:name] will be understood as the word category "name" and will be resolved with wiktionary.
                \t Please check https://www.wiktionary.org/ if the category exits.\n
\t-n, --count:\t Will produce n code names`
    };
};
