const { HttpInjector } = require('../../injectors');
const DatabaseProvider = require('../../providers/database');

class Handler extends HttpInjector {
  constructor(){
    super();
    this.database = new DatabaseProvider();
  }

  async main(event) {
    try {
      const { unitId } = event.pathParameters;

      const topSelling = await this.database.findAll({
        pk: `UNIT#${unitId}`,
        sk: `SELLING`,
        indexName: 'GSI6',
        pkName: 'gsi6_pk',
        skName: 'gsi6_sk',
        maxResults: 3,
        ascending: false,
      });

      const filteredTopSelling =topSelling.filter(({ selling }) => selling > 0)
        .map(({ productId, name, selling }) => ({
          productId, name, selling 
        }))

      return this.handlerSuccess(filteredTopSelling);
    } catch (error) {
      console.log('Erro *** ', error.stack);

      return this.handlerError({ statusCode: 500 });
    }
  }
}

const handler = new Handler();

module.exports = handler.main.bind(handler);