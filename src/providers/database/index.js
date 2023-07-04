const AWS = require('aws-sdk');
const { v4 } = require('uuid');

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
        updatedAt: new Date().toISOString(),
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

    return Item;
  }

  async findAll() {
    const params = {
      KeyConditionExpression: 'id <> :invalidId',
      ExpressionAttributeValues: {
        ':invalidId': 'invalid'
      }
    }
  
    const { Items } = await this.dynamoDB.query(params).promise();

    return Items;
  }

  async update(data) {
    const { id, ...item } = data;

    const keysToUpdate = Object.keys(item);

    if (!keysToUpdate.length) throw new Error('You need to update at least one field');

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