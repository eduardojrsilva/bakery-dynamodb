const Joi = require('joi');

const DatabaseProvider = require('../../../providers/database');
const decoratorValidator = require('../../../util/decoratorValidator');
const globalEnum = require('../../../util/globalEnum');

class Handler {
  constructor(){
    this.database = new DatabaseProvider('EmployeePosition');
  }

  static validator() {
    return Joi.object({
      employeeId: Joi.string().required(),
      positionId: Joi.string().required(),
      unitId: Joi.string().required(),
      salary: Joi.number().required(),
    });
  }

  transformResponse(response) {
    const { pk, sk, employee_position_pk, employee_position_sk, ...data } = response;

    const id = sk.split('#')[3];

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

  handlerError(error) {
    const response = {
      statusCode: error.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({error: error.message || "Couldn't create item!"})
    }

    return response;
  }

  async main(event) {
    try {
      const data = event.body;

      const { employeeId, positionId, unitId, ...params } = data;
      
      const item = {
        employeeId,
        positionId,
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

      return this.handlerSuccess(this.transformResponse(employeePosition));
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