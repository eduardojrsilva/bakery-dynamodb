const AWS = require('aws-sdk');

const FIRST_ITEM_INDEX = 0;
const SECOND_ITEM_INDEX = 1;

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

async function getRelations({ joinTable, itemId, itemSide = 'left' }) {
  if (itemSide !== 'left' && itemSide !== 'right') return;

  const [keyIndex, relationIndex] = itemSide === 'left' ? [FIRST_ITEM_INDEX, SECOND_ITEM_INDEX] : [SECOND_ITEM_INDEX, FIRST_ITEM_INDEX];

  const joinTableDatabase = new AWS.DynamoDB.DocumentClient({ params: { TableName: joinTable } });

  const { Items: allItems } = await joinTableDatabase.scan().promise();

  const activeItems = allItems.filter(({ active }) => active);

  const relations = activeItems.filter(({ id }) => id.split('#')[keyIndex] === itemId);

  const transformed = relations.map((item) => {
    const id = item.id.split('#')[relationIndex];

    return {
      ...item,
      id,
    };
  });

  return transformed;
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

module.exports = { verifyIfExistsInTable, verifyIfExistsInList, removeActiveProperty, getRelations, writePutTransaction };