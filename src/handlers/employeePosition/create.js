const Joi = require('joi');

const DatabaseProvider = require('../../providers/database');
const decoratorValidator = require('../../util/decoratorValidator');
const globalEnum = require('../../util/globalEnum');

const { verifyIfExistsInTable } = require('../../providers/database/utils');

class Handler {
  constructor(){
    this.database = new DatabaseProvider('EmployeePosition');
  }

  static validator() {
    return Joi.object({
      employeeId: Joi.string().required(),
      positionId: Joi.string().required(),
      salary: Joi.number().required(),
    });
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

      const { employeeId, positionId, ...params } = data;
      
      const employeeExists = await verifyIfExistsInTable('Employees', employeeId);
      
      if (!employeeExists) return this.handlerError({ statusCode: 400, message: 'Employee not found' });

      const positionExists = await verifyIfExistsInTable('Positions', positionId);

      if (!positionExists) return this.handlerError({ statusCode: 400, message: 'Position not found' });

      const id = `${employeeId}#${positionId}`;

      const supplierEquipment = await this.database.create({ id, ...params });

      return this.handlerSuccess(supplierEquipment);
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