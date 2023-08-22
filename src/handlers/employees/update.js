const Joi = require('joi');

const DatabaseProvider = require('../../providers/database');
const decoratorValidator = require('../../util/decoratorValidator');
const globalEnum = require('../../util/globalEnum');

class Handler {
  constructor(){
    this.database = new DatabaseProvider();
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

  static validator() {
    return Joi.object({
      id: Joi.string().required(),
      unitId: Joi.string().required(),
      name: Joi.string().optional(),
    });
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
      const { id, unitId, ...data } = event.body;

      const params = {
        pk: 'UNIT',
        sk: `UNIT#${unitId}#EMPLOYEE#${id}`,
        ...data,
      }

      const employee = await this.database.update(params);

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