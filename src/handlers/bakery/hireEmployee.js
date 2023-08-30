const Joi = require('joi');

const generateUniqueId = require('../../util/id');

const DatabaseProvider = require('../../providers/database');
const decoratorValidator = require('../../util/decoratorValidator');
const globalEnum = require('../../util/globalEnum');

class Handler {
  constructor(){
    this.database = new DatabaseProvider();
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
      body: JSON.stringify({error: error.message || "Error when hire employee!"})
    }

    return response;
  }

  async main(event) {
    try {
      const data = event.body;

      const { unitId, employeeName, positions } = data;

      const transactionData = [];
      
      const employeeId = generateUniqueId();

      const employee = {
        pk: 'UNIT',
        sk: `UNIT#${unitId}#EMPLOYEE#${employeeId}`,
        id: employeeId,
        name: employeeName,
        gsi3_pk: `EMPLOYEE#${employeeId}`,
        gsi3_sk: `EMPLOYEE#${employeeId}`,
      }

      transactionData.push({ operation: 'Put', Item: employee });

      positions.map(async ({ positionId, salary }) => {
        const position = {
          pk: 'POSITION',
          sk: `POSITION#${positionId}#EMPLOYEE#${employeeId}`,
          positionId,
          employeeId,
          salary,
          gsi3_pk: `EMPLOYEE#${employeeId}`,
          gsi3_sk: `POSITION#${positionId}`,
        }
  
        transactionData.push({ operation: 'Put', Item: position });

        const unitPosition = {
          pk: 'UNIT',
          sk: `UNIT#${unitId}#POSITION#${positionId}`,
          unitId,
          positionId,
          gsi4_pk: `POSITION#${positionId}`,
          gsi4_sk: `UNIT#${unitId}`,
        }
  
        transactionData.push({
          operation: 'Put',
          Item: unitPosition,
          ConditionExpression: 'attribute_not_exists(sk)',
        });
      });

      await this.database.transact(transactionData);

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