const defaultConfig = require('@wordpress/scripts/config/webpack.config');

module.exports = {
    ...defaultConfig,
    externals: {
        opensheetmusicdisplay: 'opensheetmusicdisplay',
        externalsType: 'umd'
      }
}