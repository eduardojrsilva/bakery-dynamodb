module.exports = {
  // CRUD
  
  unitsCreate: require('./crud/units/create.js'),
  unitsFindById: require('./crud/units/findById.js'),
  unitsFindAll: require('./crud/units/findAll.js'),
  unitsUpdate: require('./crud/units/update.js'),
  unitsDelete: require('./crud/units/delete.js'),

  suppliersCreate: require('./crud/suppliers/create.js'),
  suppliersFindById: require('./crud/suppliers/findById.js'),
  suppliersFindAll: require('./crud/suppliers/findAll.js'),
  suppliersUpdate: require('./crud/suppliers/update.js'),
  suppliersDelete: require('./crud/suppliers/delete.js'),

  equipmentCreate: require('./crud/equipment/create.js'),
  equipmentFindById: require('./crud/equipment/findById.js'),
  equipmentFindAll: require('./crud/equipment/findAll.js'),
  equipmentUpdate: require('./crud/equipment/update.js'),
  equipmentDelete: require('./crud/equipment/delete.js'),

  productsCreate: require('./crud/products/create.js'),
  productsFindById: require('./crud/products/findById.js'),
  productsFindAll: require('./crud/products/findAll.js'),
  productsUpdate: require('./crud/products/update.js'),
  productsDelete: require('./crud/products/delete.js'),

  employeesCreate: require('./crud/employees/create.js'),
  employeesFindById: require('./crud/employees/findById.js'),
  employeesFindAll: require('./crud/employees/findAll.js'),
  employeesUpdate: require('./crud/employees/update.js'),
  employeesDelete: require('./crud/employees/delete.js'),

  positionsCreate: require('./crud/positions/create.js'),
  positionsFindById: require('./crud/positions/findById.js'),
  positionsFindAll: require('./crud/positions/findAll.js'),
  positionsUpdate: require('./crud/positions/update.js'),
  positionsDelete: require('./crud/positions/delete.js'),

  customersCreate: require('./crud/customers/create.js'),
  customersFindById: require('./crud/customers/findById.js'),
  customersFindAll: require('./crud/customers/findAll.js'),
  customersUpdate: require('./crud/customers/update.js'),
  customersDelete: require('./crud/customers/delete.js'),

  salesCreate: require('./crud/sales/create.js'),
  salesFindById: require('./crud/sales/findById.js'),
  salesFindAll: require('./crud/sales/findAll.js'),
  salesUpdate: require('./crud/sales/update.js'),
  salesDelete: require('./crud/sales/delete.js'),

  // JOIN TABLES

  unitSupplierCreate: require('./join/unitSupplier/create.js'),
  unitSupplierFindAll: require('./join/unitSupplier/findAll.js'),

  supplierEquipmentCreate: require('./join/supplierEquipment/create.js'),
  supplierEquipmentFindAll: require('./join/supplierEquipment/findAll.js'),

  unitEquipmentCreate: require('./join/unitEquipment/create.js'),
  unitEquipmentFindAll: require('./join/unitEquipment/findAll.js'),

  supplierProductCreate: require('./join/supplierProduct/create.js'),
  supplierProductFindAll: require('./join/supplierProduct/findAll.js'),

  unitProductCreate: require('./join/unitProduct/create.js'),
  unitProductFindAll: require('./join/unitProduct/findAll.js'),

  employeePositionCreate: require('./join/employeePosition/create.js'),
  employeePositionFindAll: require('./join/employeePosition/findAll.js'),

  productSaleCreate: require('./join/productSale/create.js'),
  productSaleFindAll: require('./join/productSale/findAll.js'),

  // BAKERY

  hireEmployee: require('./bakery/hireEmployee.js'),

  topSellingProducts: require('./bakery/topSellingProducts.js'),

  finishSale: require('./bakery/finishSale.js'),

  buyFromSupplier: require('./bakery/buyFromSupplier.js'),
}
