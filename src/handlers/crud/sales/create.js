const Joi = require('joi');

const generateUniqueId = require('../../../util/id');

const DatabaseProvider = require('../../../providers/database');
const decoratorValidator = require('../../../util/decoratorValidator');
const globalEnum = require('../../../util/globalEnum');
const { HttpInjector } = require('../../../injectors');

class Handler extends HttpInjector {
  constructor(){
    super();
    this.database = new DatabaseProvider();
  }

  static validator() {
    return Joi.object({
      totalPrice: Joi.number().required(),
      unitId: Joi.string().required(),
      employeeId: Joi.string().required(),
      customerId: Joi.string().required(),
    });
  }

  async main(event) {
    try {
      const { unitId, customerId, employeeId, ...params } = event.body;

      const id = generateUniqueId();

      const item = {
        id,
        unitId,
        customerId,
        employeeId,
        pk: 'SALE',
        sk: `METADATA#${id}`,
        ...params,
        gsi6_pk: `UNIT#${unitId}`,
        gsi6_sk: `SALE#${id}`,
        gsi5_pk: `CUSTOMER#${customerId}`,
        gsi5_sk: `SALE#${id}`,
        gsi3_pk: `EMPLOYEE#${employeeId}`,
        gsi3_sk: `SALE#${id}`,
      }

      const sale = await this.database.create(item);
      
      const unitSale = {
        unitId,
        saleId: id,
        pk: 'UNIT',
        sk: `UNIT#${unitId}#SALE#${id}`,
        gsi6_pk: `UNIT#${unitId}`,
        gsi6_sk: `UNIT#${unitId}`,
      }

      await this.database.create(unitSale);

      const unitCustomer = {
        unitId,
        customerId,
        pk: 'UNIT',
        sk: `UNIT#${unitId}#CUSTOMER#${customerId}`,
        gsi5_pk: `CUSTOMER#${customerId}`,
        gsi5_sk: `UNIT#${unitId}`,
      }

      await this.database.create(unitCustomer);

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