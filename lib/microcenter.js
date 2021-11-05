const axios = require('axios');
const cheerio = require('cheerio');
const product = require('./models/product');
const mongoose = require('mongoose');

const getProductBySKU = async function (sku) {
  const dbInstance = await product.findOne({ sku: sku }).exec();
  if (dbInstance && new Date() - dbInstance.lastUpdated < 1) {
    return dbInstance;
  }
  let response;
  try {
    response = await axios.get(
      `https://www.microcenter.com/search/search_results.aspx?N=&cat=&Ntt=${sku}`
    );
  } catch (err) {
    console.warn(err);
    return null;
  }
  const $ = cheerio.load(response.data);
  const output = $('.product_wrapper');
  if (output.length < 1) {
    return null;
  }
  const productData = {};
  if (output.length === 1) {
    productData['sku'] = output.find('.sku').text().replace('SKU: ', '');
    productData['name'] = output.find('h2 > a').text().split(';')[0];
    productData['url'] =
      'https://microcenter.com' + output.find('h2 > a').attr('href');
    productData['image'] = output.find('img').attr('src');
    productData['brand'] = output.find('h2 > a').attr('data-brand');
    productData['qty'] = parseInt(
      output
        .find('.inventoryCnt')
        .text()
        .match(/[0-9]{0,}/)[0]
    );
    productData['price'] = output
      .find('.price')
      .text()
      .replaceAll('\n', '')
      .replaceAll(' ', '')
      .replace('$', '');
    productData['rating'] = output
      .find('.imgReviews')
      .attr('alt')
      .split(' ')[0];
    productData['lastUpdated'] = new Date();
    //
    product
      .findOneAndUpdate({ sku: productData.sku }, productData, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      })
      .exec();
    return productData;
  } else {
    return 'More than one element was found';
  }
};
const updateAllProducts = async function () {
  const dbInstance = await product.find({}).exec();
  for (let i = 0; i < dbInstance.length; i++) {
    await getProductBySKU(dbInstance[i].sku);
  }
};

module.exports = { getProductBySKU, updateAllProducts };
