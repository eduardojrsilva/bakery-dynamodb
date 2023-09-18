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

      const employeePosition = await this.database.findAll({
        indexName: 'GSI3',
        pkName: 'gsi3_pk',
        skName: 'gsi3_sk',
        pk: `EMPLOYEE#${id}`,
        sk: `POSITION`
      });

      return this.handlerSuccess(employeePosition);
    } catch (error) {
      console.log('Erro *** ', error.stack);

      return this.handlerError({ statusCode: 500 });
    }
  }
}

const handler = new Handler();

module.exports = handler.main.bind(handler);