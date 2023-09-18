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
      equipmentId: Joi.string().required(),
      stock: Joi.number().required(),
    });
  }

  async main(event) {
    try {
      const data = event.body;
      
      const { supplierId, equipmentId, ...params } = data;

      const equipment = await this.database.findById({
        pk: 'EQUIPMENT',
        sk: equipmentId,
      });

      if (!equipment) this.handlerError({ statusCode: 500 });

      const { name, price } = equipment;

      const item = {
        supplierId,
        equipmentId,
        pk: 'SUPPLIER',
        sk: `SUPPLIER#${supplierId}#EQUIPMENT#${equipmentId}`,
        ...params,
        name,
        price,
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