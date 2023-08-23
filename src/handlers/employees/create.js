const Joi = require('joi');

const generateUniqueId = require('../../util/id');

const DatabaseProvider = require('../../providers/database');
const decoratorValidator = require('../../util/decoratorValidator');
const globalEnum = require('../../util/globalEnum');

class Handler {
  constructor(){
    this.database = new DatabaseProvider();
  }

  static validator() {
    return Joi.object({
      name: Joi.string().required(),
      unitId: Joi.string(),
    });
  }

  transformResponse(response) {
    const { pk, sk, ...data } = response;

    const id = sk.split('#')[3];

    const transformed = {
      id,
      ...data,
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
      body: JSON.stringify({error: "Couldn't create item!"})
    }

    return response;
  }

  async main(event) {
    try {
      const { unitId, ...data } = event.body;

      const id = generateUniqueId();

      const item = {
        pk: 'UNIT',
        sk: `UNIT#${unitId}#EMPLOYEE#${id}`,
        ...data,
        employee_sale_pk: `EMPLOYEE#${id}`,
        employee_sale_sk: `EMPLOYEE#${id}`,
        employee_position_pk: `EMPLOYEE#${id}`,
        employee_position_sk: `EMPLOYEE#${id}`,
      }

      const employee = await this.database.create(item);

      return this.handlerSuccess(this.transformResponse(employee));
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