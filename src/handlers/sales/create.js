const Joi = require('joi');

const DatabaseProvider = require('../../providers/database');
const { verifyIfExistsInTable } = require('../../providers/database/utils');
const decoratorValidator = require('../../util/decoratorValidator');
const globalEnum = require('../../util/globalEnum');

class Handler {
  constructor(){
    this.database = new DatabaseProvider('Sales');
  }

  static validator() {
    return Joi.object({
      // products (ProductSale[])
      sellerId: Joi.string().required(),
      customerId: Joi.string().required(),
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

      const sellerExists = await verifyIfExistsInTable('Employees', data.sellerId);

      if (!sellerExists) return this.handlerError({ statusCode: 400, message: 'Seller not found' });
      
      const customerExists = await verifyIfExistsInTable('Customers', data.customerId);
      
      if (!customerExists) return this.handlerError({ statusCode: 400, message: 'Customer not found' });

      const sale = await this.database.create(data);

      return this.handlerSuccess(sale);
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