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
    });
  }

  transformResponse(response) {
    const { pk, sk, ...data } = response;

    const [_, id] = sk.split('#');

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

      const id = generateUniqueId();

      const item = {
        pk: 'SALE',
        sk: `METADATA#${id}`,
        ...data,
      }

      const sale = await this.database.create(item);

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