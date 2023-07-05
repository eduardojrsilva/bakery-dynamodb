const DatabaseProvider = require('../../providers/database');

class Handler {
  constructor(){
    this.database = new DatabaseProvider('Sales');
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
      body: JSON.stringify({error: "Couldn't delete item!"})
    }

    return response;
  }

  async main(event) {
    try {
      const { id } = event.pathParameters;

      const sale = await this.database.delete(id);

      return this.handlerSuccess(sale);
    } catch (error) {
      console.log('Erro *** ', error.stack);

      return this.handlerError({ statusCode: 500 });
    }
  }
}

const handler = new Handler();

module.exports = handler.main.bind(handler);