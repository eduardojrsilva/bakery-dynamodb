const Joi = require('joi');

const DatabaseProvider = require('../../providers/database');
const decoratorValidator = require('../../util/decoratorValidator');
const globalEnum = require('../../util/globalEnum');

const { verifyIfExistsInTable } = require('../../providers/database/utils');

class Handler {
  constructor(){
    this.database = new DatabaseProvider('UnitProduct');
  }

  static validator() {
    return Joi.object({
      unitId: Joi.string().required(),
      productId: Joi.string().required(),
      price: Joi.number().required(),
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

      const { unitId, productId, ...params } = data;
      
      const unitExists = await verifyIfExistsInTable('Units', unitId);
      
      if (!unitExists) return this.handlerError({ statusCode: 400, message: 'Unit not found' });

      const productExists = await verifyIfExistsInTable('Products', productId);

      if (!productExists) return this.handlerError({ statusCode: 400, message: 'Product not found' });

      const id = `${unitId}#${productId}`;

      const supplierProduct = await this.database.create({ id, ...params });

      return this.handlerSuccess(supplierProduct);
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