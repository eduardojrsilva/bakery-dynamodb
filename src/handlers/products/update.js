const Joi = require('joi');

const DatabaseProvider = require('../../providers/database');
const decoratorValidator = require('../../util/decoratorValidator');
const globalEnum = require('../../util/globalEnum');

class Handler {
  constructor(){
    this.database = new DatabaseProvider('Products');
  }

  static validator() {
    return Joi.object({
      id: Joi.string().required(),
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
      const data = event.body;

      const product = await this.database.update(data);

      return this.handlerSuccess(product);
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