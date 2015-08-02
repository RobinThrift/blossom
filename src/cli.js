#!/usr/bin/env node
import {loadGenerators} from './utils';
import blossom from './index';

loadGenerators()
    .then((generators) => {
        blossom(process.argv, generators);
    }, (err) => {
        console.error(err);
    });
