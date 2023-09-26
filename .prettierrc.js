const standardConfig = require('prettier-config-standard');
module.exports = {
  ...standardConfig,
  semi: false,
  singleQuote: true,
  plugins: ['prettier-plugin-css-order']
};