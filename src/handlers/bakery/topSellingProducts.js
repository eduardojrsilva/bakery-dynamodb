const DatabaseProvider = require('../../providers/database');

class Handler {
  constructor(){
    this.unitProductDatabase = new DatabaseProvider('UnitProduct');
    this.productSaleDatabase = new DatabaseProvider('ProductSale');
    this.productsDatabase = new DatabaseProvider('Products');
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
      const { unitId } = event.pathParameters;

      const allUnitProducts = await this.unitProductDatabase.findAll();
      const unitProducts = allUnitProducts.filter(({ id }) => id.includes(unitId));

      const productsIds = unitProducts.map(({ id }) => {
        const [_, productId] = id.split('#');
        return productId;
      });

      const allSales = await this.productSaleDatabase.findAll();
      const sales = allSales.filter(({ id }) => {
        const [productId, _] = id.split('#');
        return productsIds.includes(productId);
      });

      console.log('sales: ', sales);

      const allProducts = await this.productsDatabase.findAll();
      const products = allProducts.filter(({ id }) => productsIds.includes(id));

      const productsNames = products.reduce((acc, { id, name }) => {
        return {
          ...acc,
          [id]: name,
        };
      }, {});

      const amountByProduct = sales.reduce((acc, { productId, amount }) => {
        const productName = productsNames[productId];
    
        const oldAmount = acc[productName] || 0;

        console.log('acc: ', acc);
        console.log('oldAmount: ', oldAmount);
    
        return {
          ...acc,
          [productName]: oldAmount + amount
        }
      }, {});

      console.log('amountByProduct: ', amountByProduct);

      const sorted = Object.entries(amountByProduct).sort(([_a, amountA], [_b, amountB]) => amountB - amountA);

      const topFive = Object.fromEntries(sorted.slice(0 , 5));

      return this.handlerSuccess(topFive);
    } catch (error) {
      console.log('Erro *** ', error.stack);

      return this.handlerError({ statusCode: 500 });
    }
  }
}

const handler = new Handler();

module.exports = handler.main.bind(handler);