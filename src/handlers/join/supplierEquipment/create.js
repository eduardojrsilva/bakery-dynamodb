const Joi = require('joi');

const DatabaseProvider = require('../../../providers/database');
const decoratorValidator = require('../../../util/decoratorValidator');
const globalEnum = require('../../../util/globalEnum');

class Handler {
  constructor(){
    this.database = new DatabaseProvider();
  }

  static validator() {
    return Joi.object({
      supplierId: Joi.string().required(),
      equipmentId: Joi.string().required(),
      stock: Joi.number().required(),
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
      
      const { supplierId, equipmentId, ...params } = data;

      const item = {
        supplierId,
        equipmentId,
        pk: 'SUPPLIER',
        sk: `SUPPLIER#${supplierId}#EQUIPMENT#${equipmentId}`,
        ...params,
        gsi2_pk: `EQUIPMENT#${equipmentId}`,
        gsi2_sk: `SUPPLIER#${supplierId}`,
      }

      const equipmentSupplier = await this.database.create(item);

      return this.handlerSuccess(equipmentSupplier);
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