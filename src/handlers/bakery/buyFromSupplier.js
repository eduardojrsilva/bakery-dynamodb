const Joi = require('joi');

const DatabaseProvider = require('../../providers/database');
const decoratorValidator = require('../../util/decoratorValidator');
const globalEnum = require('../../util/globalEnum');

class Handler {
  constructor() {
    this.database = new DatabaseProvider();
  }

  static validator() {
    return Joi.object({
      unitId: Joi.string().required(),
      supplierId: Joi.string().required(),
      products: Joi.array().items(
        Joi.object({
          productId: Joi.string().required(),
          amount: Joi.number().integer().required(),
          resalePrice: Joi.number().required(),
        }),
      ).optional(),
      equipments: Joi.array().items(
        Joi.object({
          equipmentId: Joi.string().required(),
          amount: Joi.number().integer().required(),
        }),
      ).optional(),
    });
  }

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
      body: JSON.stringify({error: error.message || "Error when purchasing"})
    }

    return response;
  }

  async main(event) {
    try {
      const data = event.body;

      const { unitId, supplierId, products, equipments } = data;

      if (!products?.length && !equipments?.length)
        return this.handlerError({ statusCode: 400, message: 'You must purchase at least one item' });

        let productsTotalPrice;
        let equipmentsTotalPrice;
        const transactionData = [];
        
      if (products) {
        const supplierProducts = await this.database.findAll({
          pk: 'SUPPLIER',
          sk: `SUPPLIER#${supplierId}#PRODUCT`
        });

        console.log('supplier products: ', supplierProducts)

        const nonExistentProduct = supplierProducts.some(({ productId: id }) => !products.some(({ productId }) => productId === id));

        if (nonExistentProduct || !supplierProducts.length)
          return this.handlerError({ statusCode: 400, message: 'The supplier does not have any of the requested products' });

        const productDataById = supplierProducts.reduce((acc, { productId, name, price, stock }) => ({
          ...acc,
          [productId]: { name, price, stock },
        }), {});

        console.log('prodcuts by id: ', productDataById)

        productsTotalPrice = products.reduce((acc, { productId, amount }, indexA) => {
          console.log(`dentro do reduce (volta ${indexA}): \nacc: ${acc} \nproductId: ${productId} \namount: ${amount}`)
          return acc + productDataById[productId].price * amount;
        }, 0);

        console.log('total price: ', productsTotalPrice)

        console.log('products: ', products)

        products.forEach(async ({ productId, resalePrice, amount }) => {
          const productKey = {
            pk: 'UNIT',
            sk: `UNIT#${unitId}#PRODUCT#${productId}`,
          }

          const alreadyExistentProduct = await this.database.findById(productKey);

          console.log('already existent product', alreadyExistentProduct)
          
          if (alreadyExistentProduct) {
            const { stock } = alreadyExistentProduct;

            const newStock = stock + amount;
            
            transactionData.push({
              operation: 'Update',
              Key: productKey,
              UpdateExpression: 'SET stock = :newStock',
              ExpressionAttributeValues: {
                ':newStock': newStock,
              },
            });
          } else {

            console.log('AQUI')
            // const { name } = productDataById[productId];
            const name =  'teste';

            const unitProduct = {
              ...productKey,
              unitId,
              productId,
              name,
              stock: amount,
              price: resalePrice,
              gsi1_pk: `PRODUCT#${productId}`,
              gsi1_sk: `UNIT#${unitId}`,
            }

            transactionData.push({ operation: 'Put', Item: unitProduct });
          }
        });
      }

      if (equipments) {
        const supplierEquipments = await this.database.findAll({
          pk: 'SUPPLIER',
          sk: `SUPPLIER#${supplierId}#EQUIPMENT`
        });

        const nonExistentEquipment = supplierEquipments.some(({ equipmentId: id }) => !equipments.some(({ equipmentId }) => equipmentId === id));

        if (nonExistentEquipment || !supplierEquipments.length)
          return this.handlerError({ statusCode: 400, message: 'The supplier does not have any of the requested equipments' });

        const equipmentDataById = supplierEquipments.reduce((acc, { equipmentId, name, price, stock }) => ({
          ...acc,
          [equipmentId]: { name, price, stock },
        }), {});

        equipmentsTotalPrice = equipments.reduce((acc, { equipmentId, amount }) => {
          return acc + equipmentDataById[equipmentId].price * amount;
        }, 0);

        equipments.forEach(async ({ equipmentId, amount }) => {
          const equipmentKey = {
            pk: 'UNIT',
            sk: `UNIT#${unitId}#EQUIPMENT#${equipmentId}`,
          }

          const alreadyExistentEquipment = await this.database.findById(equipmentKey);
          
          if (alreadyExistentEquipment) {
            const { stock } = alreadyExistentEquipment;

            const newStock = stock + amount;
            
            transactionData.push({
              operation: 'Update',
              Key: equipmentKey,
              UpdateExpression: 'SET stock = :newStock',
              ExpressionAttributeValues: {
                ':newStock': newStock,
              },
            });
          } else {
            const { name } = equipmentDataById[equipmentId];

            const unitEquipment = {
              ...equipmentKey,
              unitId,
              equipmentId,
              name,
              stock: amount,
              gsi2_pk: `EQUIPMENT#${equipmentId}`,
              gsi2_sk: `UNIT#${unitId}`,
            }

            transactionData.push({ operation: 'Put', Item: unitEquipment });
          }
        });
      }

      console.log('transaction data: ', transactionData)

      await this.database.transact(transactionData);

      return this.handlerSuccess({ productsTotalPrice, equipmentsTotalPrice });
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