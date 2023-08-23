const DatabaseProvider = require('../../providers/database');

class Handler {
  constructor(){
    this.database = new DatabaseProvider();
  }

  transformResponse(response) {
    const { pk, sk, product_sale_pk, product_sale_sk,...data } = response;

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
      const { saleId } = event.pathParameters;

      const saleProducts = await this.database.findAll({
        pk: 'SALE',
        sk: `SALE#${saleId}#PRODUCT`
      });

      return this.handlerSuccess(saleProducts.map(this.transformResponse));
    } catch (error) {
      console.log('Erro *** ', error.stack);

      return this.handlerError({ statusCode: 500 });
    }
  }
}

const handler = new Handler();

module.exports = handler.main.bind(handler);