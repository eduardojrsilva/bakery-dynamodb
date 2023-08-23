const Joi = require('joi');

const DatabaseProvider = require('../../providers/database');
const decoratorValidator = require('../../util/decoratorValidator');
const globalEnum = require('../../util/globalEnum');

class Handler {
  constructor(){
    this.employeeDatabase = new DatabaseProvider('Employees');
    this.employeePositionDatabase = new DatabaseProvider('EmployeePosition');
  }

  static validator() {
    return Joi.object({
      unitId: Joi.string(),
      positions: Joi.array().items(
        Joi.object({
          positionId: Joi.string(),
          salary: Joi.number(),
        })
      ),
      employeeName: Joi.string(),
    });
  };

  handlerSuccess() {
    const response = {
      statusCode: 200,
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

      const { unitId, employeeName, positions } = data;
      
      const employeeId = generateUniqueId();

      const employee = {
        pk: 'UNIT',
        sk: `UNIT#${unitId}#EMPLOYEE#${employeeId}`,
        name: employeeName,
        employee_sale_pk: `EMPLOYEE#${employeeId}`,
        employee_sale_sk: `EMPLOYEE#${employeeId}`,
        employee_position_pk: `EMPLOYEE#${employeeId}`,
        employee_position_sk: `EMPLOYEE#${employeeId}`,
      }

      await this.database.create(employee);

      await Promise.all(
        positions.forEach(({ positionId, salary }) => {
          const position = {
            pk: 'POSITION',
            sk: `POSITION#${positionId}#EMPLOYEE#${employeeId}`,
            salary,
            employee_position_pk: `EMPLOYEE#${employeeId}`,
            employee_position_sk: `POSITION#${positionId}`,
          }
    
          await this.database.create(position);

          const unitPosition = {
            pk: 'UNIT',
            sk: `UNIT#${unitId}#POSITION#${positionId}`,
            ...params,
            position_unit_pk: `POSITION#${positionId}`,
            position_unit_sk: `UNIT#${unitId}`,
          }
    
          await this.database.create(unitPosition);
        })
      )

      return this.handlerSuccess();
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