const AWS = require('aws-sdk');

async function verifyIfExistsInTable(TableName, id) {
  const dynamoDB = new AWS.DynamoDB.DocumentClient({ params: { TableName } });

  const { Items: allItems } = await dynamoDB.scan().promise();

  const item = allItems.find((item) => item.id === id);

  return !!item;
}

function verifyIfExistsInList(items, id) {
  const item = items.find((item) => item.id === id);

  return !!item;
}

module.exports = { verifyIfExistsInTable, verifyIfExistsInList };