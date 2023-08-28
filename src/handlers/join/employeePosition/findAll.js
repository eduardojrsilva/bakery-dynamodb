const DatabaseProvider = require('../../providers/database');

class Handler {
  constructor(){
    this.database = new DatabaseProvider('EmployeePosition');
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

  handlerError(data) {
    const response = {
      statusCode: data.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({error: "Couldn't read items!"})
    }

    return response;
  }

  async main(event) {
    try {
      const { positionId } = event.pathParameters;

      const employeePosition = await this.database.findAll({
        pk: 'POSITION',
        sk: `POSITION#${positionId}#EMPLOYEE`
      });

      return this.handlerSuccess(employeePosition.map(this.transformResponse));
    } catch (error) {
      console.log('Erro *** ', error.stack);

      return this.handlerError({ statusCode: 500 });
    }
  }
}

const handler = new Handler();

module.exports = handler.main.bind(handler);