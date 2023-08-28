const AWS = require('aws-sdk');

const FIRST_ITEM_INDEX = 0;
const SECOND_ITEM_INDEX = 1;

function removeActiveProperty(item) {
  const { active, ...props } = item;

  return { ...props };
}

async function writePutTransaction(transactionsItems) {
  const dynamoDB = new AWS.DynamoDB.DocumentClient();

  const TransactItems = transactionsItems.map(({ item, tableName }) => ({
    Put: {
      Item: {
        ...item,
        createdAt: new Date().toISOString(),
        active: true,
      },
      TableName: tableName
    }
  }));

  await dynamoDB.transactWrite({
    TransactItems
  }).promise();
}

module.exports = { removeActiveProperty, writePutTransaction };