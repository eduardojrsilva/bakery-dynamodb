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
      unitId: Joi.string(),
    });
  }

  async main(event) {
    try {
      const { unitId, ...data } = event.body;

      const id = generateUniqueId();

      const item = {
        id,
        pk: 'UNIT',
        sk: `UNIT#${unitId}#EMPLOYEE#${id}`,
        ...data,
        gsi3_pk: `EMPLOYEE#${id}`,
        gsi3_sk: `EMPLOYEE#${id}`,
      }

      const employee = await this.database.create(item);

      return this.handlerSuccess(employee);
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