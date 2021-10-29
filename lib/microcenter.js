const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
  getProductByURL: async function (url) {
    let microcenterData;
    try {
      microcenterData = await axios.get(url);
    } catch (err) {
      return null;
    }
    const $ = cheerio.load(microcenterData.data);
    let productData;
    $('#product > script[type="application/ld+json"]').each((i, el) => {
      if (i === 2) {
        productData = JSON.parse(el.children[0].data);
      }
    });
    productData.qty =
      $('#pnlInventory > p > span.inventoryCnt')
        .text()
        .match(/[0-9]{0,}/)[0] || 0;
    delete productData['@context'];
    delete productData['@type'];
    productData.image = productData.image[0];
    productData.rating = productData.aggregateRating.ratingValue;
    delete productData.aggregateRating;
    delete productData.description;
    productData.price = productData.offers.price;
    productData.url = 'https://microcenter.com' + productData.offers.url;
    productData.price = productData.offers.price;
    productData.instock = productData.qty > 0;
    productData.lastUpdated = new Date();
    delete productData.offers;
    return productData;
  }
};
