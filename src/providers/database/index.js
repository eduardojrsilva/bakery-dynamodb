const AWS = require('aws-sdk');

const { normalizeResponse } = require('./utils');

class DatabaseProvider {
  constructor() {
    this.dynamoDB = new AWS.DynamoDB.DocumentClient({ params: { TableName: 'Bakery' } });
  }

  async create(data) {
    const params = {
      Item: {
        ...data,
        createdAt: new Date().toISOString(),
        active: true,
      }
    }
    
    await this.dynamoDB.put(params).promise();

    const item = normalizeResponse(params.Item);
  
    return item;
  }

  async findById({ pk, sk }) {
    const params = {
      Key: {
        pk,
        sk,
      }
    };
  
    const { Item } = await this.dynamoDB.get(params).promise();

    if (!Item || !Item.active) throw new Error('Item not found');

    const item = normalizeResponse(Item);

    return item;
  }

  async findAll({ pk, sk }) {
    const { skConditionExpression, skAttributeValues } = sk ? {
      skConditionExpression: ` and begins_with(sk, :sk)`,
      skAttributeValues: { ':sk': sk },
    } : {
      skConditionExpression: '',
      skAttributeValues: {},
    };

    const KeyConditionExpression = `pk = :pk${skConditionExpression}`;

    const ExpressionAttributeValues = {
      ':pk': pk,
      ...skAttributeValues,
    };
    
    const params = {
      KeyConditionExpression,
      ExpressionAttributeValues,
    };

    const { Items } = await this.dynamoDB.query(params).promise();

    const activeItems = Items.filter(({ active }) => active).map(normalizeResponse);

    return activeItems;
  }

  async update(data) {
    const { pk, sk, ...item } = data;

    const keysToUpdate = Object.keys(item);

    if (!keysToUpdate.length) throw new Error('You need to update at least one field');

    const UpdateExpression = `SET ${keysToUpdate.map((key) => `#${key} = :new${key}`).join(', ')}, #updatedAt = :now`;

    const ExpressionAttributeNames = keysToUpdate.reduce((acc, key) => ({
      ...acc,
      [`#${key}`]: key,
    }), { ['#updatedAt']: 'updatedAt' });

    const ExpressionAttributeValues = keysToUpdate.reduce((acc, key) => ({
      ...acc,
      [`:new${key}`]: item[key],
    }), { [':now']: new Date().toISOString() });

    const params = {
      Key: {
        pk,
        sk,
      },
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    }
  
    const { Attributes } = await this.dynamoDB.update(params).promise();

    const updated = normalizeResponse(Attributes);

    return updated;
  }

  async delete({ pk, sk }) {
    const params = {
      Key: {
        pk,
        sk,
      },
      UpdateExpression: 'SET #active = :disabled',
      ExpressionAttributeNames: {
        '#active': 'active'
      },
      ExpressionAttributeValues: {
        ':disabled': false
      },
      ReturnValues: 'ALL_NEW',
    }
  
    const { Attributes } = await this.dynamoDB.update(params).promise();

    const removed = normalizeResponse(Attributes);

    return removed;
  }
}

module.exports = DatabaseProvider;