/**
 * @file
 * Grunt configurations.
 */

module.exports = function (grunt) {
  grunt.initConfig({
    env: grunt.option('env') || process.env.NODE_ENV || 'development',
    pkg: grunt.file.readJSON('package.json')
  });

  // Load production tasks by default
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-postcss');
  grunt.loadNpmTasks('grunt-sass');

  grunt.config('clean', [
    'public/css',
    'public/js'
  ]);

  grunt.config('copy', {
    dev: {
      src: 'node_modules/vue/dist/vue.js',
      dest: 'public/js/vue.js'
    },
    dist: {
      src: 'node_modules/vue/dist/vue.min.js',
      dest: 'public/js/vue.js'
    }
  });

  grunt.config('uglify', {
    options: {
      mangle: false,
      wrap: false,
      screwIE8: true
    },
    dist: {
      files: {
        'public/js/bundle.js': [
          'assets/js/**/*.js',
          'node_modules/whatwg-fetch/fetch.js'
        ]
      }
    },
    dev: {
      options: {
        sourceMap: true,
        beautify: true
      },
      files: {
        'public/js/bundle.js': [
          'assets/js/**/*.js',
          'node_modules/whatwg-fetch/fetch.js',
        ]
      }
    }
  });

  grunt.config('postcss', {
    options: {
      syntax: require('postcss-scss'),
      processors: [
        require('autoprefixer')({ browsers: ['last 3 version', 'ff >= 36', 'ie >= 11'] }),
        require('postcss-discard-duplicates')()
      ],
      map: {
        inline: false
      }
    },
    dist: {
      options: {
        map: false,
        processors: [
          require('cssnano')()
        ]
      },
      src: 'public/css/**/*.css'
    },
    dev: {
      src: 'public/css/**/*.css'
    }
  });

  grunt.config('sass', {
    options: {
      outputStyle: 'expanded',
      sourceMap: true,
      indentedSyntax: true,
      sassDir: 'assets/scss',
      cssDir: 'public/css',
      includePaths: [
        'node_modules/normalize-scss/sass',
        'node_modules/modularscale-sass/stylesheets',
        'node_modules/typi/scss',
        'node_modules/tachyons-sass'
      ]
    },
    dev: {
      files: [{
        expand: true,
        cwd: 'assets/scss/',
        src: ['**/*.scss'],
        dest: 'public/css/',
        ext: '.css'
      }]
    },
    dist: {
      options: {
        sourceMap: false
      },
      files: [{
        expand: true,
        cwd: 'assets/scss/',
        src: ['**/*.scss'],
        dest: 'public/css/',
        ext: '.css'
      }]
    }
  });

  if (grunt.config('env') !== 'production') {
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');

    grunt.config('watch', {
      css: {
        files: ['assets/scss/**/*.scss', 'assets/js/**/*.js'],
        tasks: ['build']
      }
    });

    grunt.config('eslint', {
      options: {
        ignorePattern: ['assets/js/lib/**/*.js']
      },
      target: ['assets/js/**/*.js']
    });

    grunt.config('nodemon', {
      dev: {
        script: './app/index.js',
        options: {
          ignore: ['node_modules/**'],
          ext: 'js',
          watch: ['./app'],
        }
      }
    });

    grunt.config('concurrent', {
      options: {
        logConcurrentOutput: true
      },
      tasks: ['nodemon:dev', 'watch']
    });

    grunt.registerTask('build', ['clean', 'sass:dev', 'postcss:dev', 'eslint', 'uglify:dev', 'copy:dev']);
  }

  grunt.registerTask('dist', ['clean', 'sass:dist', 'postcss:dist', 'uglify:dist', 'copy:dist']);
  grunt.registerTask('default', ['build', 'concurrent']);
};
