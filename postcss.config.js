module.exports = {
  map: 'inline',
  plugins: {
    'postcss-import': {},
    precss: {
      'postcss-preset-env': {
        stage: 1,
        preserve: true
      }
    },
    autoprefixer: {},
    cssnano: process.env.NODE_ENV === 'production' ? {} : false
  }
};
