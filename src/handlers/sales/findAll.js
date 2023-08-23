const DatabaseProvider = require('../../providers/database');

class Handler {
  constructor(){
    this.database = new DatabaseProvider();
  }

  transformResponse(response) {
    const {
      pk,
      sk,
      unit_sale_pk,
      unit_sale_sk,
      customer_sale_pk,
      customer_sale_sk,
      employee_sale_pk,
      employee_sale_sk,
      ...data
    } = response;

    const [_sale, id] = sk.split('#');
    const [_unit, unit] = unit_sale_pk.split('#');
    const [_employee, employee] = employee_sale_pk.split('#');
    const [_customer, customer] = customer_sale_pk.split('#');

    const transformed = {
      id,
      ...data,
      unit,
      employee,
      customer,
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

  async main() {
    try {
      const sales = await this.database.findAll({
        pk: 'SALE',
        sk: 'METADATA'
      });

      return this.handlerSuccess(sales.map(this.transformResponse));
    } catch (error) {
      console.log('Erro *** ', error.stack);

      return this.handlerError({ statusCode: 500 });
    }
  }
}

const handler = new Handler();

module.exports = handler.main.bind(handler);