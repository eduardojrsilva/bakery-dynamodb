const Joi = require('joi');

const generateUniqueId = require('../../util/id');

const DatabaseProvider = require('../../providers/database');
const { verifyIfExistsInTable } = require('../../providers/database/utils');
const decoratorValidator = require('../../util/decoratorValidator');
const globalEnum = require('../../util/globalEnum');

class Handler {
  constructor(){
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

  transformResponse(response) {
    const {
      pk,
      sk,
      unit_sale_pk,
      unit_sale_sk,
      customer_sale_pk,
      customer_sale_sk,
      employee_sale_pk,
      employee_sale_sk,
      ...data
    } = response;

    const [_sale, id] = sk.split('#');
    const [_unit, unit] = unit_sale_pk.split('#');
    const [_employee, employee] = employee_sale_pk.split('#');
    const [_customer, customer] = customer_sale_pk.split('#');

    const transformed = {
      id,
      ...data,
      unit,
      employee,
      customer,
    };

    return transformed;
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
      const { unitId, customerId, employeeId, ...params } = event.body;

      const id = generateUniqueId();

      const item = {
        pk: 'SALE',
        sk: `METADATA#${id}`,
        ...params,
        unit_sale_pk: `UNIT#${unitId}`,
        unit_sale_sk: `SALE#${id}`,
        customer_sale_pk: `CUSTOMER#${customerId}`,
        customer_sale_sk: `SALE#${id}`,
        employee_sale_pk: `EMPLOYEE#${employeeId}`,
        employee_sale_sk: `SALE#${id}`,
      }

      const sale = await this.database.create(item);
      
      const unitSale = {
        pk: 'UNIT',
        sk: `UNIT#${unitId}#SALE#${id}`,
        unit_sale_pk: `UNIT#${unitId}`,
        unit_sale_sk: `UNIT#${unitId}`,
      }

      await this.database.create(unitSale);

      const unitCustomer = {
        pk: 'UNIT',
        sk: `UNIT#${unitId}#CUSTOMER#${customerId}`,
        customer_unit_pk: `CUSTOMER#${customerId}`,
        customer_unit_sk: `UNIT#${unitId}`,
      }

      await this.database.create(unitCustomer);

      return this.handlerSuccess(this.transformResponse(sale));
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