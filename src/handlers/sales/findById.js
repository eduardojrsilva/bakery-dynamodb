const DatabaseProvider = require('../../providers/database');

class Handler {
  constructor(){
    this.database = new DatabaseProvider();
  }

  transformResponse(response) {
    const { pk, sk, ...data } = response;

    const [_, id] = sk.split('#');

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
      body: JSON.stringify({error: "Couldn't read item!"})
    }

    return response;
  }

  async main(event) {
    try {
      const { id } = event.pathParameters;

      const sale = await this.database.findById({
        pk: 'SALE',
        sk: `METADATA#${id}`,
      });

      return this.handlerSuccess(this.transformResponse(sale));
    } catch (error) {
      console.log('Erro *** ', error.stack);

      return this.handlerError({ statusCode: 500 });
    }
  }
}

const handler = new Handler();

module.exports = handler.main.bind(handler);