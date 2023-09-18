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
      name: Joi.string().required(),
      price: Joi.number().required(),
      category: Joi.string().required(),
    });
  }

  async main(event) {
    try {
      const data = event.body;

      const id = generateUniqueId();

      const item = {
        id,
        pk: 'EQUIPMENT',
        sk: id,
        ...data,
        gsi2_pk: `EQUIPMENT#${id}`,
        gsi2_sk: `EQUIPMENT#${id}`,
      }

      const equipment = await this.database.create(item);

      return this.handlerSuccess(equipment);
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