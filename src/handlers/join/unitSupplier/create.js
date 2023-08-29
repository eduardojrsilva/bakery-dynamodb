const Joi = require('joi');

const DatabaseProvider = require('../../../providers/database');
const decoratorValidator = require('../../../util/decoratorValidator');
const globalEnum = require('../../../util/globalEnum');

const { verifyIfExistsInTable } = require('../../../providers/database/utils');

class Handler {
  constructor(){
    this.database = new DatabaseProvider('UnitSupplier');
  }

  static validator() {
    return Joi.object({
      unitId: Joi.string().required(),
      supplierId: Joi.string().required(),
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
      const { unitId, supplierId } = event.body;

      const unitExists = await verifyIfExistsInTable('Units', unitId);

      if (!unitExists) return this.handlerError({ statusCode: 400, message: 'Unit not found' });
      
      const supplierExists = await verifyIfExistsInTable('Suppliers', supplierId);
      
      if (!supplierExists) return this.handlerError({ statusCode: 400, message: 'Supplier not found' });

      const id = `${unitId}#${supplierId}`;

      const unitSupplier = await this.database.create({ id, unitId, supplierId });

      return this.handlerSuccess(unitSupplier);
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