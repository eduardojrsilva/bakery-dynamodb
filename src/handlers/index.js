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
  // unitSupplierFindById: require('./unitSupplier/findById.js'),
  unitSupplierFindAll: require('./unitSupplier/findAll.js'),
  // unitSupplierUpdate: require('./unitSupplier/update.js'),
  // unitSupplierDelete: require('./unitSupplier/delete.js'),

  supplierEquipmentCreate: require('./supplierEquipment/create.js'),
  // supplierEquipmentFindById: require('./supplierEquipment/findById.js'),
  supplierEquipmentFindAll: require('./supplierEquipment/findAll.js'),
  // supplierEquipmentUpdate: require('./supplierEquipment/update.js'),
  // supplierEquipmentDelete: require('./supplierEquipment/delete.js'),

  unitEquipmentCreate: require('./unitEquipment/create.js'),
  // unitEquipmentFindById: require('./unitEquipment/findById.js'),
  unitEquipmentFindAll: require('./unitEquipment/findAll.js'),
  // unitEquipmentUpdate: require('./unitEquipment/update.js'),
  // unitEquipmentDelete: require('./unitEquipment/delete.js'),

  supplierProductCreate: require('./supplierProduct/create.js'),
  // supplierProductFindById: require('./supplierProduct/findById.js'),
  supplierProductFindAll: require('./supplierProduct/findAll.js'),
  // supplierProductUpdate: require('./supplierProduct/update.js'),
  // supplierProductDelete: require('./supplierProduct/delete.js'),

  // unitProductCreate: require('./unitProduct/create.js'),
  // // unitProductFindById: require('./unitProduct/findById.js'),
  // unitProductFindAll: require('./unitProduct/findAll.js'),
  // // unitProductUpdate: require('./unitProduct/update.js'),
  // // unitProductDelete: require('./unitProduct/delete.js'),

  // employeePositionCreate: require('./employeePosition/create.js'),
  // // employeePositionFindById: require('./employeePosition/findById.js'),
  // employeePositionFindAll: require('./employeePosition/findAll.js'),
  // // employeePositionUpdate: require('./employeePosition/update.js'),
  // // employeePositionDelete: require('./employeePosition/delete.js'),

  // productSaleCreate: require('./productSale/create.js'),
  // // productSaleFindById: require('./productSale/findById.js'),
  // productSaleFindAll: require('./productSale/findAll.js'),
  // // productSaleUpdate: require('./productSale/update.js'),
  // // productSaleDelete: require('./productSale/delete.js'),
}
