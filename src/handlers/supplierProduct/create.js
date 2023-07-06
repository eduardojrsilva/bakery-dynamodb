const Joi = require('joi');

const DatabaseProvider = require('../../providers/database');
const decoratorValidator = require('../../util/decoratorValidator');
const globalEnum = require('../../util/globalEnum');

const { verifyIfExistsInTable } = require('../../providers/database/utils');

class Handler {
  constructor(){
    this.database = new DatabaseProvider('SupplierProduct');
  }

  static validator() {
    return Joi.object({
      supplierId: Joi.string().required(),
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

      const { supplierId, productId, ...params } = data;
      
      const supplierExists = await verifyIfExistsInTable('Suppliers', supplierId);
      
      if (!supplierExists) return this.handlerError({ statusCode: 400, message: 'Supplier not found' });

      const productExists = await verifyIfExistsInTable('Products', productId);

      if (!productExists) return this.handlerError({ statusCode: 400, message: 'Product not found' });

      const id = `${supplierId}#${productId}`;

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