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
      supplierId: Joi.string().required(),
      productId: Joi.string().required(),
      price: Joi.number().required(),
      stock: Joi.number().required(),
    });
  }

  async main(event) {
    try {
      const data = event.body;

      const { supplierId, productId, ...params } = data;

      const product = await this.database.findById({
        pk: 'PRODUCT',
        sk: productId,
      });

      if (!product) this.handlerError({ statusCode: 500 });

      const { name } = product;
      
      const item = {
        supplierId,
        productId,
        pk: 'SUPPLIER',
        sk: `SUPPLIER#${supplierId}#PRODUCT#${productId}`,
        name,
        ...params,
        gsi1_pk: `PRODUCT#${productId}`,
        gsi1_sk: `SUPPLIER#${supplierId}`,
      }

      const productSupplier = await this.database.create(item);

      return this.handlerSuccess(productSupplier);
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