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

  employeesCreate: require('./employees/create.js'),
  employeesFindById: require('./employees/findById.js'),
  employeesFindAll: require('./employees/findAll.js'),
  employeesUpdate: require('./employees/update.js'),
  employeesDelete: require('./employees/delete.js'),

  positionsCreate: require('./positions/create.js'),
  positionsFindById: require('./positions/findById.js'),
  positionsFindAll: require('./positions/findAll.js'),
  positionsUpdate: require('./positions/update.js'),
  positionsDelete: require('./positions/delete.js'),

  customersCreate: require('./customers/create.js'),
  customersFindById: require('./customers/findById.js'),
  customersFindAll: require('./customers/findAll.js'),
  customersUpdate: require('./customers/update.js'),
  customersDelete: require('./customers/delete.js'),

  salesCreate: require('./sales/create.js'),
  salesFindById: require('./sales/findById.js'),
  salesFindAll: require('./sales/findAll.js'),
  salesUpdate: require('./sales/update.js'),
  salesDelete: require('./sales/delete.js'),

  // JOIN TABLES

  unitSupplierCreate: require('./unitSupplier/create.js'),
  unitSupplierFindAll: require('./unitSupplier/findAll.js'),

  supplierEquipmentCreate: require('./supplierEquipment/create.js'),
  supplierEquipmentFindAll: require('./supplierEquipment/findAll.js'),

  unitEquipmentCreate: require('./unitEquipment/create.js'),
  unitEquipmentFindAll: require('./unitEquipment/findAll.js'),

  supplierProductCreate: require('./supplierProduct/create.js'),
  supplierProductFindAll: require('./supplierProduct/findAll.js'),

  unitProductCreate: require('./unitProduct/create.js'),
  unitProductFindAll: require('./unitProduct/findAll.js'),

  employeePositionCreate: require('./employeePosition/create.js'),
  employeePositionFindAll: require('./employeePosition/findAll.js'),

  productSaleCreate: require('./productSale/create.js'),
  productSaleFindAll: require('./productSale/findAll.js'),

  // BAKERY

  buyFromSupplier: require('./bakery/buyFromSupplier.js'),
}
