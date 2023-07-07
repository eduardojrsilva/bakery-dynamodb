const AWS = require('aws-sdk');

async function verifyIfExistsInTable(TableName, id) {
  const dynamoDB = new AWS.DynamoDB.DocumentClient({ params: { TableName } });

  const { Items: allItems } = await dynamoDB.scan().promise();

  const item = allItems.find((item) => item.id === id && item.active);

  return !!item;
}

function verifyIfExistsInList(items, id) {
  const item = items.find((item) => item.id === id);

  return !!item;
}

function removeActiveProperty(item) {
  const { active, ...props } = item;

  return { ...props };
}

module.exports = { verifyIfExistsInTable, verifyIfExistsInList, removeActiveProperty };