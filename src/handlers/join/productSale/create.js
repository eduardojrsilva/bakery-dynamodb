const Joi = require('joi');

const DatabaseProvider = require('../../providers/database');
const decoratorValidator = require('../../util/decoratorValidator');
const globalEnum = require('../../util/globalEnum');

class Handler {
  constructor(){
    this.database = new DatabaseProvider();
  }

  static validator() {
    return Joi.object({
      productId: Joi.string().required(),
      saleId: Joi.string().required(),
      name: Joi.string().required(),
      unitSalePrice: Joi.number().required(),
      amount: Joi.number().integer().required(),
    });
  }

  transformResponse(response) {
    const { pk, sk, product_sale_pk, product_sale_sk, ...data } = response;

    const id = sk.split('#')[3];

    const transformed = {
      id,
      ...data,
    };

    return transformed;
  }

  handlerSuccess(data) {
    const response = {
      statusCode: 200,
      body: JSON.stringify(data)
    }

    return response;
  }

  handlerError(error) {
    const response = {
      statusCode: error.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({error: error.message || "Couldn't create item!"})
    }

    return response;
  }

  async main(event) {
    try {
      const data = event.body;

      const { productId, saleId, ...params } = data;
      
      const item = {
        saleId,
        productId,
        pk: 'SALE',
        sk: `SALE#${saleId}#PRODUCT#${productId}`,
        ...params,
        gsi1_pk: `PRODUCT#${productId}`,
        gsi1_sk: `SALE#${saleId}`,
      }

      const productSale = await this.database.create(item);

      return this.handlerSuccess(this.transformResponse(productSale));
    } catch (error) {
      console.log('Erro *** ', error.stack);

      return this.handlerError({ statusCode: 500 });
    }
  }
}


const handler = new Handler();

module.exports = decoratorValidator(
  handler.main.bind(handler),
  Handler.validator(),
  globalEnum.ARG_TYPE.BODY
);