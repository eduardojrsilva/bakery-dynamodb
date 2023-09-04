const DatabaseProvider = require('../../../providers/database');

class Handler {
  constructor(){
    this.database = new DatabaseProvider();
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
      const { id } = event.pathParameters;

      const unitEquipment = await this.database.findAll({
        indexName: 'GSI2',
        pkName: 'gsi2_pk',
        skName: 'gsi2_sk',
        
        pk: `EQUIPMENT#${id}`,
        sk: 'UNIT'
      });

      return this.handlerSuccess(unitEquipment);
    } catch (error) {
      console.log('Erro *** ', error.stack);

      return this.handlerError({ statusCode: 500 });
    }
  }
}

const handler = new Handler();

module.exports = handler.main.bind(handler);