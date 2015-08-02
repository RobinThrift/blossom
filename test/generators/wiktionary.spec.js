
import {chainableSpy} from '../helper';
import * as wiktionary from '../../src/generators/wiktionary';
import nock from 'nock';

suite('Blossom – Generators – Wiktionary', () => {
    let commander;

    setup(() => {
        commander = {};
        chainableSpy('command', commander);
        chainableSpy('alias', commander);
        chainableSpy('option', commander);
        chainableSpy('action', commander);

        nock('https://en.wiktionary.org')
            .get('/w/api.php')
            .query(true)
            .reply(200, (uri) => {
                let name = {title: ''}
                if (/Flowers/.test(uri)) {
                    name.title = 'rose';
                } else if (/Metals/.test(uri)) {
                    name.title = 'copper';
                }

                return {
                    query: {
                        categorymembers: [name]
                    }
                };
            });
    });

    test('register()', () => {
        let info = wiktionary.register(commander);
        info.name.should.equal('wiktionary');
        info.help.should.be.a.String();
        commander._command.calledOnce.should.equal(true);
        commander._alias.calledOnce.should.equal(true);
        commander._action.calledOnce.should.equal(true);
        commander._option.calledOnce.should.equal(true);
        wiktionary.action.should.be.a.Function();
    });

    test('action(\'hello-world\')', (done) => {
        wiktionary.action('hello-world').done((name) => {
            name.should.equal('hello-world');
            done();
        });
    });

    test('action(\'hello-[:flowers]\')', (done) => {
        wiktionary.action('hello-[:flowers]').done((name) => {
            name.should.equal('hello-rose');
            done();
        });
    });

    test('action(\'[:metals]-[:flowers]\')', (done) => {
        wiktionary.action('[:metals]-[:flowers]').done((name) => {
            name.should.equal('copper-rose');
            done();
        });
    });
});

import Q from 'q';
Q.onerror = (err) => { throw err; };
