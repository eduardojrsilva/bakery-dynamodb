const Joi = require('joi');

const generateUniqueId = require('../../../util/id');

const DatabaseProvider = require('../../../providers/database');
const decoratorValidator = require('../../../util/decoratorValidator');
const globalEnum = require('../../../util/globalEnum');
const { HttpInjector } = require('../../../injectors');

class Handler extends HttpInjector {
  constructor(){
    super();
    this.database = new DatabaseProvider();
  }

  static validator() {
    return Joi.object({
      cnpj: Joi.string().required(),
      name: Joi.string().required(),
    });
  }

  async main(event) {
    try {
      const data = event.body;

      const id = generateUniqueId();

      const item = {
        id,
        pk: 'SUPPLIER',
        sk: `METADATA#${id}`,
        ...data,
      }

      const supplier = await this.database.create(item);

      return this.handlerSuccess(supplier);
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