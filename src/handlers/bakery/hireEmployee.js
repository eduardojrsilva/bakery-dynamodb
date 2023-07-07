const Joi = require('joi');

const DatabaseProvider = require('../../providers/database');
const decoratorValidator = require('../../util/decoratorValidator');
const globalEnum = require('../../util/globalEnum');

const { verifyIfExistsInTable } = require('../../providers/database/utils');

class Handler {
  constructor(){
    this.employeeDatabase = new DatabaseProvider('Employees');
    this.employeePositionDatabase = new DatabaseProvider('EmployeePosition');
  }

  static validator() {
    return Joi.object({
      unitsId: Joi.string(),
      positions: Joi.array().items(
        Joi.object({
          positionId: Joi.string(),
          salary: Joi.number(),
        })
      ),
      employeeName: Joi.string(),
    });
  };

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

      const { unitsId, employeeName, positions } = data;
      
      const employee = await this.employeeDatabase.create({ name: employeeName, unitsId });

      const unitExists = await verifyIfExistsInTable('Units', unitsId);
      
      if (!unitExists) return this.handlerError({ statusCode: 400, message: 'Units not found' });

      const employeeExists = await verifyIfExistsInTable('Employees', employee.id);
      
      if (!employeeExists) return this.handlerError({ statusCode: 400, message: 'Employee not found' });

      const positionsExist = await Promise.all(
        positions.map(async ({ positionId }) => {
          return await verifyIfExistsInTable('Positions', positionId);
        })
      );
      
      const positionExists = positionsExist.every((exists) => exists);

      if (!positionExists) return this.handlerError({ statusCode: 400, message: 'Position not found' });

      await Promise.all(positions.map(async ({ positionId, salary }) => {
        const id = `${employee.id}#${positionId}`;

        await this.employeePositionDatabase.create({
          id,
          employeeId: employee.id,
          positionId,
          salary 
        });
      }));

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