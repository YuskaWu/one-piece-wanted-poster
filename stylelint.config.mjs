/** @type {import("stylelint").Config} */
export default {
  extends: ['stylelint-config-standard'],
  ignoreFiles: ['dist/**'],
  rules: {
    'selector-class-pattern': null
  }
}
