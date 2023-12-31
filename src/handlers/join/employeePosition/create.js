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
      employeeId: Joi.string().required(),
      positionId: Joi.string().required(),
      unitId: Joi.string().required(),
      salary: Joi.number().required(),
    });
  }

  async main(event) {
    try {
      const data = event.body;

      const { employeeId, positionId, unitId, ...params } = data;
      
      const item = {
        employeeId,
        positionId,
        unitId,
        pk: 'POSITION',
        sk: `POSITION#${positionId}#EMPLOYEE#${employeeId}`,
        ...params,
        gsi3_pk: `EMPLOYEE#${employeeId}`,
        gsi3_sk: `POSITION#${positionId}`,
      }

      const employeePosition = await this.database.create(item);

      const unitPosition = {
        unitId,
        positionId,
        pk: 'UNIT',
        sk: `UNIT#${unitId}#POSITION#${positionId}`,
        ...params,
        gsi4_pk: `POSITION#${positionId}`,
        gsi4_sk: `UNIT#${unitId}`,
      }

      await this.database.create(unitPosition);

      return this.handlerSuccess(employeePosition);
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