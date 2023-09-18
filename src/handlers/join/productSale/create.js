const Joi = require('joi');
const { HttpInjector } = require('../../../injectors');

const DatabaseProvider = require('../../../providers/database');
const decoratorValidator = require('../../../util/decoratorValidator');
const globalEnum = require('../../../util/globalEnum');

class Handler extends HttpInjector {
  constructor(){
    super();
    this.database = new DatabaseProvider();
  }

  static validator() {
    return Joi.object({
      productId: Joi.string().required(),
      saleId: Joi.string().required(),
      name: Joi.string().required(),
      unitSalePrice: Joi.number().required(),
      stock: Joi.number().integer().required(),
    });
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

      return this.handlerSuccess(productSale);
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