const AWS = require('aws-sdk');
const { v4 } = require('uuid');

const { verifyIfExistsInList, removeActiveProperty } = require('./utils');

class DatabaseProvider {
  constructor(TableName) {
    this.dynamoDB = new AWS.DynamoDB.DocumentClient({ params: { TableName } });
  }

  async create(data) {
    const params = {
      Item: {
        id: v4(),
        ...data,
        createdAt: new Date().toISOString(),
        active: true,
      }
    }
    
    await this.dynamoDB.put(params).promise();

    const item = removeActiveProperty(params.Item);
  
    return item;
  }

  async findById(id) {
    const params = {
      Key: {
        id
      }
    }
  
    const { Item } = await this.dynamoDB.get(params).promise();

    if (!Item || !Item.active) throw new Error('Item not found');

    const item = removeActiveProperty(Item);

    return item;
  }

  async findAll() {
    const { Items } = await this.dynamoDB.scan().promise();

    const activeItems = Items.filter(({ active }) => active).map((item) => removeActiveProperty(item));

    return activeItems;
  }

  async update(data) {
    const { id, ...item } = data;

    const keysToUpdate = Object.keys(item);

    if (!keysToUpdate.length) throw new Error('You need to update at least one field');

    const allItems = await this.findAll();

    const itemExists = verifyIfExistsInList(allItems, id);

    if (!itemExists) throw new Error('Item not found');

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
        id
      },
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    }
  
    const { Attributes } = await this.dynamoDB.update(params).promise();

    const updated = removeActiveProperty(Attributes);

    return updated;
  }

  async delete(id) {
    const allItems = await this.findAll();

    const itemExists = verifyIfExistsInList(allItems, id);

    if (!itemExists) throw new Error('Item not found');

    const params = {
      Key: {
        id
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

    const removed = removeActiveProperty(Attributes);

    return removed;
  }
}

module.exports = DatabaseProvider;