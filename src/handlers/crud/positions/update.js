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
      name: Joi.string().optional(),
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
        pk: 'POSITION',
        sk: `METADATA#${id}`,
        ...data,
      }

      const position = await this.database.update(params);

      return this.handlerSuccess(this.transformResponse(position));
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