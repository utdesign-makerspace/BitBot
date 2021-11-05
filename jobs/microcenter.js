const { updateAllProducts } = require('../lib/microcenter');

module.exports = {
  cron: '* */30 * * * *',
  action: async () => {
    console.log('Updating Products');
    await updateAllProducts();
  }
};
