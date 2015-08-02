
import {exec} from 'child_process';
import {join} from 'path';

suite('Blossom – CLI', () => {
    test('version', function(done) {
        exec(join(__dirname, '../dist/cli.js version'), (err, stdout) => {
            if (err) { return done(err); }
            stdout.should.match(/Omnom \- version: [0-9]+.[0-9]+.[0-9]+/);
            done();
        });
    });
});
