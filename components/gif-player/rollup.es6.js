'use strict';

import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';

export default {
  entry: './src/index.js',
  format: 'iife',
  plugins: [
    babel({
      exclude: './node_modules/**',
      presets: [
        [ "es2016" ]
      ],
      plugins: [
        "external-helpers"
      ],
      runtimeHelpers: true,
      babelrc: false
    }),
    uglify({}, minify)
  ],
  dest: './dist/gif-player.es6.js',
  sourceMap: true
};
