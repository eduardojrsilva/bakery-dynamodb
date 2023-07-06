const Joi = require('joi');

const DatabaseProvider = require('../../providers/database');
const decoratorValidator = require('../../util/decoratorValidator');
const globalEnum = require('../../util/globalEnum');

const { verifyIfExistsInTable } = require('../../providers/database/utils');

class Handler {
  constructor(){
    this.database = new DatabaseProvider('SupplierEquipment');
  }

  static validator() {
    return Joi.object({
      supplierId: Joi.string().required(),
      equipmentId: Joi.string().required(),
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
      
      const supplierExists = await verifyIfExistsInTable('Suppliers', data.supplierId);
      
      if (!supplierExists) return this.handlerError({ statusCode: 400, message: 'Supplier not found' });

      const equipmentExists = await verifyIfExistsInTable('Equipment', data.equipmentId);

      if (!equipmentExists) return this.handlerError({ statusCode: 400, message: 'Equipment not found' });

      const id = `${data.supplierId}#${data.equipmentId}`;

      const supplierEquipment = await this.database.create({ id });

      return this.handlerSuccess(supplierEquipment);
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