module.exports = {
  verbose: false,
  suites: ['test/*.html'],
  plugins: {
    local: {
      browsers: ['chrome']
    },
    istanbul: {
      dir: './coverage',
      reporters: ['text-summary', 'lcov'],
      include: [
        '/*.html',
        '**/bah-filter.js',
        '**/bah-free-form-filter.js',
        '**/bah-group-checkbox.js',
        '**/bah-sort.js',
        '**/bah-sort-and-filter.js'
      ],
      exclude: []
    }
  }
};
