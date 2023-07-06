const Joi = require('joi');

const DatabaseProvider = require('../../providers/database');
const decoratorValidator = require('../../util/decoratorValidator');
const globalEnum = require('../../util/globalEnum');

const { verifyIfExistsInTable } = require('../../providers/database/utils');

class Handler {
  constructor(){
    this.database = new DatabaseProvider('ProductSale');
  }

  static validator() {
    return Joi.object({
      productId: Joi.string().required(),
      saleId: Joi.string().required(),
      amount: Joi.number().integer().required(),
    });
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
      
      const productExists = await verifyIfExistsInTable('Products', productId);
      
      if (!productExists) return this.handlerError({ statusCode: 400, message: 'Product not found' });

      const saleExists = await verifyIfExistsInTable('Sales', saleId);

      if (!saleExists) return this.handlerError({ statusCode: 400, message: 'Sale not found' });

      const id = `${productId}#${saleId}`;

      const productSale = await this.database.create({ id, ...params });

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