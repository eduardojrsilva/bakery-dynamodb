const Joi = require('joi');

const DatabaseProvider = require('../../providers/database');
const decoratorValidator = require('../../util/decoratorValidator');
const globalEnum = require('../../util/globalEnum');
const generateUniqueId = require('../../util/id');

class Handler {
  constructor(){
    this.database = new DatabaseProvider();
  }

  static validator() {
    return Joi.object({
      unitId: Joi.string(),
      customerId: Joi.string(),
      sellerId: Joi.string(),
      products: Joi.array().items(
        Joi.object({
          productId: Joi.string(),
          amount: Joi.number().integer().required(),
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
      body: JSON.stringify({error: error.message || "Error when finish sale"})
    }

    return response;
  }

  async main(event) {
    try {
      const data = event.body;

      const { unitId, customerId, sellerId, products } = data;

      const saleId = generateUniqueId();
      
      let totalPrice = 0;
      const transactionData = [];

      let errorData;

      const unitProducts = await this.database.findAll({
        pk: 'UNIT',
        sk: `UNIT#${unitId}#PRODUCT`
      });

      const productDataById = unitProducts.reduce((acc, { productId, name, price, stock, selling }) => ({
        ...acc,
        [productId]: { name, price, stock },
      }), {});

      products.map(({ productId, amount }) => {
        const productData = productDataById[productId];

        if (!productData || amount > productData.stock) {
          errorData = {
            statusCode: 400,
            message: 'Our stock does not meet one of the orders'
          };

          return;
        }

        const { name, price, stock, selling } = productData;

        const newStock = stock - amount;
        const newSelling = (selling || 0) + amount;
        const newGsi6sk = `SELLING#${newSelling}`;
            
        transactionData.push({
          operation: 'Update',
          Key: {
            pk: 'UNIT',
            sk: `UNIT#${unitId}#PRODUCT#${productId}`,
          },
          UpdateExpression: 'SET stock = :newStock, selling = :newSelling, gsi6_sk = :newGsi6sk',
          ExpressionAttributeValues: {
            ':newStock': newStock,
            ':newSelling': newSelling,
            ':newGsi6sk': newGsi6sk,
          },
        });

        const saleProduct = {
          pk: 'SALE',
          sk: `SALE#${saleId}#PRODUCT#${productId}`,
          saleId,
          productId,
          name,
          amount,
          unitSalePrice: price,
          gsi1_pk: `PRODUCT#${productId}`,
          gsi1_sk: `SALE#${saleId}`,
        };

        totalPrice += (price * amount);
  
        transactionData.push({ operation: 'Put', Item: saleProduct });
      });

      if (errorData) return this.handlerError(errorData);
      
      const sale = {
        pk: 'SALE',
        sk: `METADATA#${saleId}`,
        saleId,
        totalPrice,
        gsi3_pk: `EMPLOYEE#${sellerId}`,
        gsi3_sk: `SALE#${saleId}`,
        gsi5_pk: `CUSTOMER#${customerId}`,
        gsi5_sk: `SALE#${saleId}`,
        gsi6_pk: `UNIT#${unitId}`,
        gsi6_sk: `SALE#${saleId}`,
      };

      transactionData.push({ operation: 'Put', Item: sale });
      
      await this.database.transact(transactionData);
    
      return this.handlerSuccess({ totalPrice });
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