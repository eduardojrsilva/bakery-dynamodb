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
      id: Joi.string().required(),
      totalPrice: Joi.number().optional(),
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

  handlerError(data) {
    const response = {
      statusCode: data.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({error: "Couldn't update item!"})
    }

    return response;
  }

  async main(event) {
    try {
      const { id, ...data } = event.body;

      const params = {
        pk: 'SALE',
        sk: `METADATA#${id}`,
        ...data,
      }

      const sale = await this.database.update(params);

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