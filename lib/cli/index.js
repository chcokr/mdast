/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module mdast:cli
 * @fileoverview CLI Engine.
 */

'use strict';

/*
 * Dependencies.
 */

var chalk = require('chalk');
var chokidar = require('chokidar');
var CLI = require('./cli');
var fileSetPipeline = require('./file-set-pipeline');
var path = require('path');
var watchOutputCache = require('./watch-output-cache');

/**
 * CLI engine. This is used by `bin/mdast`.
 *
 * @example
 *   engine('--use toc . --output --quiet', console.log);
 *
 * @param {Array.<*>|Object} argv - CLI arguments.
 * @param {function(Error?, boolean)} done - Callback
 *   invoked when done.
 */
function engine(argv, done) {
    var cli = new CLI(argv);

    chalk.enabled = cli.color;

    if (!cli.watch) {
        run(cli, done);
    } else {
        var watcher;

        run(cli, function () {
            /*
             * For the following variable, it might be tempting to use
             * cli.fileSet.sourcePaths here, but that doesn't actually return
             * what we need here.
             * We need the list of files that are being watched, as specified by
             * the arguments passed into argv.
             * In contrast, cli.fileSet.sourcePaths returns the list of files
             * that will be affected as a result of all the plugins being run.
             */
            var fileAbsolutePaths = cli.files.map(function (file) {
                return path.resolve(
                    file.directory,
                    file.filename + '.' + file.extension);
            });

            watcher = chokidar.watch(fileAbsolutePaths, {
                ignoreInitial: true
            }).on('all', function (type) {
                if (type === 'add' || type === 'change') {
                    run(cli, done);
                }
            }).on('error', done);

            done();
        });

        process.on('SIGINT', function () {
            watchOutputCache.writeAll();

            if (watcher) {
                watcher.close();
            }
        });
    }
}

/**
 * Run the file set pipeline once.
 *
 * @param {CLI} cli - A CLI instanc.
 * @param {function(Error?, boolean)} done - Callback
 *   invoked when done.
 */
function run(cli, done) {
    var enabled = chalk.enabled;

    fileSetPipeline.run(cli, function (err) {
        /*
         * Check if any file has failed.
         */

        var hasFailed = (cli.files || []).some(function (file) {
            return (file.messages || []).some(function (message) {
                return message.fatal === true ||
                    (message.fatal === false && cli.frail);
            });
        });

        chalk.enabled = enabled;

        done(err, !hasFailed);
    });
}

/*
 * Expose.
 */

module.exports = engine;
