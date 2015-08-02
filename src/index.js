
import commander from 'commander';
import pkg from '../package';
import {capitalize} from 'lodash'

function versionCommand(program, stdout) {
    program
        .command('version')
        .action(() => {
            stdout(`${capitalize(pkg.name)} - version: ${pkg.version}`);
        });
}

function printHelp(info, stdout) {
    stdout(info.map((generator) => {
        return `[${generator.name.toUpperCase()}]\n${generator.help}`
    }).join('\n'));
}

export default function main(args, generators) {
    versionCommand(commander, console.log);

    let info = generators.map((generator) => {
        return generator.register(commander, console.log, console.error);
    });

    commander.on('--help', () => {
        printHelp(info, console.log);
    });

    commander
        .command('help')
        .action(() => {
            printHelp(info, console.log);
        });

    if (args.slice(2).length === 0) {
        printHelp(info, console.log);
    } else {
        commander.parse(args);
    }
}
