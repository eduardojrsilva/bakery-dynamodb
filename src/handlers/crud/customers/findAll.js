const { HttpInjector } = require('../../../injectors');
const DatabaseProvider = require('../../../providers/database');

class Handler extends HttpInjector {
  constructor(){
    super();
    this.database = new DatabaseProvider();
  }

  async main() {
    try {
      const customers = await this.database.findAll({
        pk: 'CUSTOMER',
      });

      return this.handlerSuccess(customers);
    } catch (error) {
      console.log('Erro *** ', error.stack);

      return this.handlerError({ statusCode: 500 });
    }
  }
}

const handler = new Handler();

module.exports = handler.main.bind(handler);