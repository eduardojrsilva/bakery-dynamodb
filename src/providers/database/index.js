const AWS = require('aws-sdk');
const { v4 } = require('uuid');

const { verifyIfExistsInList } = require('./utils');

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
      }
    }
    
    await this.dynamoDB.put(params).promise();
  
    return params.Item;
  }

  async findById(id) {
    const params = {
      Key: {
        id
      }
    }
  
    const { Item } = await this.dynamoDB.get(params).promise();

    if (!Item) throw new Error('Item not found');

    return Item;
  }

  async findAll() {
    const { Items } = await this.dynamoDB.scan().promise();

    return Items;
  }

  async update(data) {
    const { id, ...item } = data;

    const keysToUpdate = Object.keys(item);

    if (!keysToUpdate.length) throw new Error('You need to update at least one field');

    const allItems = await this.findAll();

    const itemExists = verifyIfExistsInList(allItems, id);

    if (!itemExists) throw new Error('Item not found');

    const UpdateExpression = `SET ${keysToUpdate.map((key) => `#${key} = :new${key}`).join(', ')}`;

    const ConditionExpression = keysToUpdate.map((key) => `#${key} <> :new${key}`).join(', ');

    const ExpressionAttributeNames = keysToUpdate.reduce((acc, key) => ({
      ...acc,
      [`#${key}`]: key,
    }), {});

    const ExpressionAttributeValues = keysToUpdate.reduce((acc, key) => ({
      ...acc,
      [`:new${key}`]: item[key],
    }), {});

    const params = {
      Key: {
        id
      },
      UpdateExpression,
      ConditionExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues
    }
  
    await this.dynamoDB.update(params).promise();

    return data;
  }

  async delete(id) {
    const allItems = await this.findAll();

    const itemExists = verifyIfExistsInList(allItems, id);

    if (!itemExists) throw new Error('Item not found');

    const params = {
      Key: {
        id
      }
    }
  
    await this.dynamoDB.delete(params).promise();

    return { removedItem: id };
  }
}

module.exports = DatabaseProvider;