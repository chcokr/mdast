/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module mdast:defaults
 * @fileoverview Default values for parse and
 *  stringification settings.
 */

'use strict';

/* eslint-env commonjs */

/*
 * Note that `stringify.entities` is a string.
 */

module.exports = {
    'parse': {
        'position': true,
        'gfm': true,
        'yaml': true,
        'commonmark': false,
        'footnotes': false,
        'pedantic': false,
        'breaks': false
    },
    'stringify': {
        'entities': 'false',
        'setext': false,
        'closeAtx': false,
        'looseTable': false,
        'spacedTable': true,
        'incrementListMarker': true,
        'fences': false,
        'fence': '`',
        'bullet': '-',
        'listItemIndent': 'tab',
        'rule': '*',
        'ruleSpaces': true,
        'ruleRepetition': 3,
        'strong': '*',
        'emphasis': '_'
    }
};
