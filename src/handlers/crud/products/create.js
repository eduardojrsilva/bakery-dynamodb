const Joi = require('joi');

const generateUniqueId = require('../../../util/id');

const DatabaseProvider = require('../../../providers/database');
const decoratorValidator = require('../../../util/decoratorValidator');
const globalEnum = require('../../../util/globalEnum');

class Handler {
  constructor(){
    this.database = new DatabaseProvider();
  }

  static validator() {
    return Joi.object({
      name: Joi.string().required(),
    });
  }

  transformResponse(response) {
    const { pk, sk, ...data } = response;

    const transformed = {
      id: sk,
      ...data,
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
      body: JSON.stringify({error: "Couldn't create item!"})
    }

    return response;
  }

  async main(event) {
    try {
      const data = event.body;

      const id = generateUniqueId();

      const item = {
        pk: 'PRODUCT',
        sk: id,
        ...data,
        product_supplier_pk: `PRODUCT#${id}`,
        product_supplier_sk: `PRODUCT#${id}`,
        product_unit_pk: `PRODUCT#${id}`,
        product_unit_sk: `PRODUCT#${id}`,
        product_sale_pk: `PRODUCT#${id}`,
        product_sale_sk: `PRODUCT#${id}`,
      }

      const product = await this.database.create(item);

      return this.handlerSuccess(this.transformResponse(product));
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