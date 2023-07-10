const Joi = require('joi');

const DatabaseProvider = require('../../providers/database');
const decoratorValidator = require('../../util/decoratorValidator');
const globalEnum = require('../../util/globalEnum');

class Handler {
  constructor(){
    this.unitProductDatabase = new DatabaseProvider('UnitProduct');
    this.salesDatabase = new DatabaseProvider('Sales');
    this.productSaleDatabase = new DatabaseProvider('ProductSale');
  }

  static validator() {
    return Joi.object({
      customerId: Joi.string(),
      sellerId: Joi.string(),
      products: Joi.array().items(
        Joi.object({
          productId: Joi.string(),
          amount: Joi.number().integer().max(30).required(),
        })
      ),
    });
  };

  handlerSuccess(data) {
    const response = {
      statusCode: 200,
      body: JSON.stringify(data)
    }

    return response;
  }

  handlerError(error) {
    const response = {
      statusCode: error.statusCode || 500,
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({error: error.message || "Couldn't create item!"})
    }

    return response;
  }

  async main(event) {
    try {
      const data = event.body;

      const { customerId, sellerId, products } = data;

      const productsIds = products.map(({productId}) => productId);

      const allUnitProducts = await this.unitProductDatabase.findAll();
      const productsInfo = allUnitProducts.filter(({ id }) => {
        const [_, idProd] = id.split('#');
        return productsIds.some((productId) => idProd === productId );
      });

      const pricesById = productsInfo.reduce((acc, { id, price }) => {
        const [_, productId] = id.split('#');
        return {
          ...acc,
          [productId]: price,
        };
      }, {});

      const totalPrice = products.reduce((acc, { productId, amount }) => {
        return acc + pricesById[productId] * amount;
      }, 0);

      const sale = await this.salesDatabase.create({ customerId, sellerId });

      await Promise.all(products.map(async (product) => {
        await this.productSaleDatabase.create({
          saleId: sale.id,
          ...product 
        });
      }));
    
      return this.handlerSuccess(totalPrice);
    } catch (error) {
      console.log('Erro *** ', error.stack);

      return this.handlerError({ statusCode: 500 });
    }
  }
}


const handler = new Handler();

module.exports = decoratorValidator(
  handler.main.bind(handler),
  Handler.validator(),
  globalEnum.ARG_TYPE.BODY
);