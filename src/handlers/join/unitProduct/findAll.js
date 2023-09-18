const { HttpInjector } = require('../../../injectors');
const DatabaseProvider = require('../../../providers/database');

class Handler extends HttpInjector {
  constructor(){
    super();
    this.database = new DatabaseProvider();
  }

  async main(event) {
    try {
      const { id } = event.pathParameters;

      const unitProducts = await this.database.findAll({
        indexName: 'GSI1',
        pkName: 'gsi1_pk',
        skName: 'gsi1_sk',
        pk: `PRODUCT#${id}`,
        sk: 'UNIT'
      });

      return this.handlerSuccess(unitProducts);
    } catch (error) {
      console.log('Erro *** ', error.stack);

      return this.handlerError({ statusCode: 500 });
    }
  }
}

const handler = new Handler();

module.exports = handler.main.bind(handler);