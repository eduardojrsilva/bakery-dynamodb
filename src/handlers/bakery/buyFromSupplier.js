const Joi = require('joi');

const DatabaseProvider = require('../../providers/database');
const { getRelations, verifyIfExistsInList } = require('../../providers/database/utils');

const decoratorValidator = require('../../util/decoratorValidator');
const globalEnum = require('../../util/globalEnum');

class Handler {
  constructor() {
    this.unitProductDatabase = new DatabaseProvider('UnitProduct');
    this.unitEquipmentDatabase = new DatabaseProvider('UnitEquipment');
    this.equipmentDatabase = new DatabaseProvider('Equipment');
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
      
      const unitSuppliers = await getRelations({ joinTable: 'UnitSupplier', itemId: unitId });

      const supplierRegistered = verifyIfExistsInList(unitSuppliers, supplierId);

      if (!supplierRegistered)
        return this.handlerError({ statusCode: 400, message: 'Supplier not registered in the unit' });

      if (!products?.length && !equipments?.length)
        return this.handlerError({ statusCode: 400, message: 'You must purchase at least one item' });

      let productsTotalPrice;
      let equipmentsTotalPrice;

      if (products) {
        const supplierProducts = await getRelations({ joinTable: 'SupplierProduct', itemId: supplierId });

        const nonExistentProduct = supplierProducts.some(({ id }) => !products.some(({ productId }) => productId === id));

        if (nonExistentProduct || !supplierProducts.length)
          return this.handlerError({ statusCode: 400, message: 'The supplier does not have any of the requested products' });

        const pricesById = supplierProducts.reduce((acc, { id, price }) => {
          const productRequested = products.find(({ productId }) => productId === id);

          if (!productRequested) return acc;

          return {
            ...acc,
            [id]: price,
          }
        }, {});

        productsTotalPrice = products.reduce((acc, { productId, amount }) => {
          return acc + pricesById[productId] * amount;
        }, 0);

        products.forEach(({ productId, resalePrice }) => {
          this.unitProductDatabase.create({
            id: `${unitId}#${productId}`,
            price: resalePrice,
          });
        });
      }

      if (equipments) {
        const supplierEquipments = await getRelations({ joinTable: 'SupplierEquipment', itemId: supplierId });

        const nonExistentEquipment = supplierEquipments.some(({ id }) => !equipments.some(({ equipmentId }) => equipmentId === id));

        if (nonExistentEquipment || !supplierEquipments.length)
          return this.handlerError({ statusCode: 400, message: 'The supplier does not have any of the requested equipments' });

        const allEquipments = await this.equipmentDatabase.findAll();

        const pricesById = allEquipments.reduce((acc, { id, price }) => {
          const equipmentRequested = equipments.find(({ equipmentId }) => equipmentId === id);

          if (!equipmentRequested) return acc;

          return {
            ...acc,
            [id]: price,
          }
        }, {});

        equipmentsTotalPrice = equipments.reduce((acc, { equipmentId, amount }) => {
          return acc + pricesById[equipmentId] * amount;
        }, 0);

        equipments.forEach(({ equipmentId }) => {
          this.unitEquipmentDatabase.create({
            id: `${unitId}#${equipmentId}`,
          });
        });
      }

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