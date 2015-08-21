#!/usr/bin/env node
import {loadGenerators} from './utils';
import omnom from './index';

loadGenerators()
    .then((generators) => {
        omnom(process.argv, generators);
    }, (err) => {
        console.error(err);
    });
