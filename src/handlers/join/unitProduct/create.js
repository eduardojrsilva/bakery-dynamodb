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
      unitId: Joi.string().required(),
      productId: Joi.string().required(),
      price: Joi.number().required(),
      stock: Joi.number().required(),
    });
  }

  async main(event) {
    try {
      const data = event.body;

      const { unitId, productId, ...params } = data;

      const product = await this.database.findById({
        pk: 'PRODUCT',
        sk: productId,
      });

      if (!product) this.handlerError({ statusCode: 500 });

      const { name } = product;

      const item = {
        unitId,
        productId,
        pk: 'UNIT',
        sk: `UNIT#${unitId}#PRODUCT#${productId}`,
        ...params,
        selling: 0,
        name,
        gsi1_pk: `PRODUCT#${productId}`,
        gsi1_sk: `UNIT#${unitId}`,
        gsi6_pk: `UNIT#${unitId}`,
        gsi6_sk:  `SELLING#0`
      }

      const productUnit = await this.database.create(item);

      return this.handlerSuccess(productUnit);
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