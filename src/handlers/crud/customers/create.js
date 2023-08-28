const Joi = require('joi');

const generateUniqueId = require('../../../util/id');

const DatabaseProvider = require('../../../providers/database');
const decoratorValidator = require('../../../util/decoratorValidator');
const globalEnum = require('../../../util/globalEnum');

class Handler {
  constructor(){
    this.database = new DatabaseProvider();
  }

  static validator() {
    return Joi.object({
      name: Joi.string().required(),
    });
  }

  transformResponse(response) {
    const { pk, sk, ...data } = response;

    const transformed = {
      id: sk,
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
      const data = event.body;

      const id = generateUniqueId();

      const item = {
        pk: 'CUSTOMER',
        sk: id,
        ...data,
        customer_sale_pk: `CUSTOMER#${id}`,
        customer_sale_sk: `CUSTOMER#${id}`,
        customer_unit_pk: `CUSTOMER#${id}`,
        customer_unit_sk: `CUSTOMER#${id}`,
      }

      const customer = await this.database.create(item);

      return this.handlerSuccess(this.transformResponse(customer));
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