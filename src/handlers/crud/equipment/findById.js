const DatabaseProvider = require('../../../providers/database');

class Handler {
  constructor(){
    this.database = new DatabaseProvider();
  }

  transformResponse(response) {
    const { pk, sk, ...data } = response;

    const transformed = {
      id: sk,
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
      body: JSON.stringify({error: "Couldn't read item!"})
    }

    return response;
  }

  async main(event) {
    try {
      const { id } = event.pathParameters;

      const equipment = await this.database.findById('EQUIPMENT', id);

      return this.handlerSuccess(this.transformResponse(equipment));
    } catch (error) {
      console.log('Erro *** ', error.stack);

      return this.handlerError({ statusCode: 500 });
    }
  }
}

const handler = new Handler();

module.exports = handler.main.bind(handler);