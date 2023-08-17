const Joi = require('joi');
const { v4 } = require('uuid');

const DatabaseProvider = require('../../providers/database');
const decoratorValidator = require('../../util/decoratorValidator');
const globalEnum = require('../../util/globalEnum');

class Handler {
  constructor(){
    this.database = new DatabaseProvider('Units');
  }

  static validator() {
    return Joi.object({
      address: Joi.string().required(),
    });
  }

  transformResponse(response) {
    const { pk, sk, ...data } = response;

    const [_, id] = pk.split('#');

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
      const data = event.body;

      const item = {
        pk: `UNIT#${v4()}`,
        sk: 'METADATA',
        ...data,
      }

      const unit = await this.database.create(item);

      return this.handlerSuccess(this.transformResponse(unit));
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