const Joi = require('joi');
const { HttpInjector } = require('../../../injectors');

const DatabaseProvider = require('../../../providers/database');
const decoratorValidator = require('../../../util/decoratorValidator');
const globalEnum = require('../../../util/globalEnum');

class Handler extends HttpInjector {
  constructor(){
    super();
    this.database = new DatabaseProvider();
  }

  static validator() {
    return Joi.object({
      id: Joi.string().required(),
      name: Joi.string().optional(),
    });
  }

  async main(event) {
    try {
      const { id, ...data } = event.body;

      const params = {
        pk: 'CUSTOMER',
        sk: id,
        ...data,
      }

      const customer = await this.database.update(params);

      return this.handlerSuccess(customer);
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