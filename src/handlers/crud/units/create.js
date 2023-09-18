const Joi = require('joi');

const DatabaseProvider = require('../../../providers/database');
const { HttpInjector } = require('../../../injectors');

const decoratorValidator = require('../../../util/decoratorValidator');
const globalEnum = require('../../../util/globalEnum');
const generateUniqueId = require('../../../util/id');

class Handler extends HttpInjector {
  constructor(){
    super();
    this.database = new DatabaseProvider();
  }

  static validator() {
    return Joi.object({
      address: Joi.string().required(),
    });
  }

  async main(event) {
    try {
      const data = event.body;

      const id = generateUniqueId();

      const item = {
        id,
        pk: 'UNIT',
        sk: `METADATA#${id}`,
        ...data,
      }

      const unit = await this.database.create(item);

      return this.handlerSuccess(unit);
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