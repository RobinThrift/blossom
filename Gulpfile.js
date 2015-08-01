
var gulp   = require('gulp'),
    config = {
        paths: {
            dest: 'dist',
            scripts: ['src/*.ts', 'src/**/*.ts'],
            typings: ['typings/**/*.d.ts'],
            tests: {
                unit: ['test/*.spec.js', 'test/**/*.spec.js']
            }
        }
    },
    args   = require('yargs')(process.argv)
                .string('only')
                .default('only', undefined)
                .argv;

function concat(a, b) {
    return a.concat(b);
}

gulp.task('scripts:lint', function() {
    var tslint = require('gulp-tslint');

    return gulp.src(config.paths.scripts)
        .pipe(tslint())
        .pipe(tslint.report('verbose'));
});

gulp.task('scripts:transpile', ['scripts:lint'], function() {
    var typescript = require('gulp-typescript');

    return gulp.src(concat(config.paths.scripts, config.paths.typings))
        .pipe(typescript({
            noExternalResolve: true,
            noImplicitAny: false,
            target: 'ES5',
            module: 'common'
        }))
        .pipe(gulp.dest(config.paths.dest));
});

gulp.task('scripts:watch', function() {
    gulp.watch(config.paths.scripts, ['scripts:transpile']);
});

gulp.task('test:unit', function() {
    var mocha = require('gulp-mocha');

    return gulp.src(config.paths.tests.unit, {read: false})
        .pipe(mocha({
            ui: 'tdd',
            grep: args.only
        }));
});

gulp.task('test:unit:watch', function() {
    gulp.watch(config.paths.scripts, ['test:unit']);
    gulp.watch(config.paths.tests.unit, ['test:unit']);
});

gulp.task('test', ['test:unit']);


gulp.task('build', ['scripts:transpile']);
