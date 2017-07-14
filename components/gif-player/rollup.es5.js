'use strict';

import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

export default {
  entry: './src/index.js',
  format: 'iife',
  plugins: [
    babel({
      exclude: './node_modules/**',
      presets: [
        [ "es2015", { "modules": false } ]
      ],
      plugins: [
        "external-helpers"
      ],
      runtimeHelpers: true,
      babelrc: false,
    }),
    uglify()
  ],
  dest: './dist/gif-player.es5.js',
  sourceMap: true
};
