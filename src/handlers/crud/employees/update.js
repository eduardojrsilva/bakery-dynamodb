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
      unitId: Joi.string().required(),
      name: Joi.string().optional(),
    });
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