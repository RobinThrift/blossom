import Q from 'q';
import {join} from 'path';
import {readdir} from 'fs';

let readDir = Q.denodeify(readdir);

export function loadGenerators() {
    let dirPath = join(__dirname, 'generators');
    return Q.async(function*() {
        let generators = yield readDir(dirPath);
        return generators.map((filename) => {
            return require(join(__dirname, 'generators', filename));
        });
    })();
}
