module.exports = {
  extends: [
    'anvilabs',
    'anvilabs/jest',
  ],
  rules: {
    'promise/prefer-await-to-callbacks': 0,
    'promise/prefer-await-to-then': 0,
  },
};
