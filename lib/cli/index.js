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
var logUpdate = require('log-update');
var spinner = require('elegant-spinner');
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
        run(cli, true, done);
    } else {
        cli.stderr([
            'If a file you\'re watching will be written to as a result of',
            'running the plugins, mdast will not rewrite over the file, but',
            'instead hold the output in memory - to avoid race conditions.',
            'When you exit the watch with a SIGINT (CTRL+C), then mdast will',
            'rewrite over the file with the latest output in memory.'
        ].join('\n'));

        var watcher;

        run(cli, true, function (err, success) {
            /*
             * We pass cli.fileSet.sourcePaths into chokidar.watch().
             * Note that this variable holds paths to not only the files that
             * the user wants to watch (as specified in argv), but also the
             * files that would be affected as a result of running the plugins
             * or have an impact on the validity of a file that the user wants
             * to watch.
             *
             * This may not sound intuitive initially as the user didn't ask
             * us to watch the extra dependent files.
             * However, there really are use cases for doing this.
             * For example, the plugin mdast-validate-links checks if the
             * links referred to in a file (call it main.md) are valid.
             * If one of the files which a link refers to changes, then it's
             * a good idea to re-validate main.md.
             *
             * Let's now talk about a different scenario.
             * Say main.md causes a rewrite over a file called dependent.md,
             * but changing dependent.md doesn't have any impact on main.md.
             * In this case, there is zero harm to watch dependent.md.
             * If the user for some reason changes dependent.md in the middle
             * of the watch, nothing will happen but the fact that
             * dependent.md has changed - so there is no confusion on the
             * user's part!
             */
            watcher = chokidar.watch(cli.fileSet.sourcePaths, {
                ignoreInitial: true
            }).on('all', function (type) {
                if (type === 'add' || type === 'change') {
                    run(cli, false, done);
                }
            }).on('error', done);

            done(err, success);
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
 * @param {bool} isFirstRunOfWatchSession - Whether
 * this run is the first time it is being called in
 * the current watch session.
 * @param {function(Error?, boolean)} done - Callback
 *   invoked when done.
 */
function run(cli, isFirstRunOfWatchSession, done) {
    var enabled = chalk.enabled;

    var getSpinnerFrame;
    if (cli.watch) {
        // Spin the spinner!
        getSpinnerFrame = spinner();
        var spinnerIntervalId = setInterval(function () {
            logUpdate(getSpinnerFrame());
        }, 50);
    }

    fileSetPipeline.run(cli, function (err) {
        /*
         * The following clearInterval() stops the spinner from further
         * animation, but it does not clear out the spinner off of the
         * console.
         * That part is taken care of in ./file-set-pipeline/log.js .
         * We don't clear out the spinner here for the following reason.
         * The way a spinner is cleared out is by erasing the last line in
         * the console.
         * If we do that here, the last line of all the plugins' output will
         * be erased, instead of the spinner.
         */
        clearInterval(spinnerIntervalId);

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

    if (!isFirstRunOfWatchSession) {
        /*
         * Without the following, the last line of the output from a non-first
         * pipeline run could get deleted, when ./file-set-pipeline/log.js
         * tries to clear out the spinner.
         *
         * In contrast, if the following is called also on the *first*
         * pipeline run, then you will see an extra spinner.
         */
        cli.stdout(getSpinnerFrame());
    }
}

/*
 * Expose.
 */

module.exports = engine;
