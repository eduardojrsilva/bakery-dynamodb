const DatabaseProvider = require('../../../providers/database');

class Handler {
  constructor(){
    this.database = new DatabaseProvider();
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
      body: JSON.stringify({error: "Couldn't read item!"})
    }

    return response;
  }

  async main(event) {
    try {
      const { unitId, id } = event.pathParameters;

      const employee = await this.database.findById({
        pk: 'UNIT',
        sk: `UNIT#${unitId}#EMPLOYEE#${id}`,
      });

      return this.handlerSuccess(employee);
    } catch (error) {
      console.log('Erro *** ', error.stack);

      return this.handlerError({ statusCode: 500 });
    }
  }
}

const handler = new Handler();

module.exports = handler.main.bind(handler);