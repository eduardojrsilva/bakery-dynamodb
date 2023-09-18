const { HttpInjector } = require('../../../injectors');
const DatabaseProvider = require('../../../providers/database');

class Handler extends HttpInjector {
  constructor(){
    super();
    this.database = new DatabaseProvider();
  }

  async main(event) {
    try {
      const { equipmentId } = event.pathParameters;

      const supplierEquipment = await this.database.findAll({
        indexName: 'GSI2',
        pkName: 'gsi2_pk',
        skName: 'gsi2_sk',
        pk: `EQUIPMENT#${equipmentId}`,
        sk: `SUPPLIER`
      });

      return this.handlerSuccess(supplierEquipment);
    } catch (error) {
      console.log('Erro *** ', error.stack);

      return this.handlerError({ statusCode: 500 });
    }
  }
}

const handler = new Handler();

module.exports = handler.main.bind(handler);