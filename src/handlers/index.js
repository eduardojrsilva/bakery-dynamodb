module.exports = {
  unitsCreate: require('./units/create.js'),
  unitsFindById: require('./units/findById.js'),
  unitsFindAll: require('./units/findAll.js'),
  unitsUpdate: require('./units/update.js'),
  unitsDelete: require('./units/delete.js'),

  suppliersCreate: require('./suppliers/create.js'),
  suppliersFindById: require('./suppliers/findById.js'),
  suppliersFindAll: require('./suppliers/findAll.js'),
  suppliersUpdate: require('./suppliers/update.js'),
  suppliersDelete: require('./suppliers/delete.js'),

  equipmentCreate: require('./equipment/create.js'),
  equipmentFindById: require('./equipment/findById.js'),
  equipmentFindAll: require('./equipment/findAll.js'),
  equipmentUpdate: require('./equipment/update.js'),
  equipmentDelete: require('./equipment/delete.js'),

  productsCreate: require('./products/create.js'),
  productsFindById: require('./products/findById.js'),
  productsFindAll: require('./products/findAll.js'),
  productsUpdate: require('./products/update.js'),
  productsDelete: require('./products/delete.js'),
}
