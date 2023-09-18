const { HttpInjector } = require('../../../injectors');
const DatabaseProvider = require('../../../providers/database');

class Handler extends HttpInjector {
  constructor(){
    super();
    this.database = new DatabaseProvider();
  }

  async main(event) {
    try {
      const { unitId } = event.pathParameters;

      const employees = await this.database.findAll({
        pk: 'UNIT',
        sk: `UNIT#${unitId}#EMPLOYEE`
      });

      return this.handlerSuccess(employees);
    } catch (error) {
      console.log('Erro *** ', error.stack);

      return this.handlerError({ statusCode: 500 });
    }
  }
}

const handler = new Handler();

module.exports = handler.main.bind(handler);