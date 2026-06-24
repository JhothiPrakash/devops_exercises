const express = require('express');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const app = express();
app.use(express.json());

// The SDK automatically picks up the IRSA credentials from the EKS environment!
const client = new DynamoDBClient({ region: 'us-east-1' });
const dynamoDb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'Customers';

// WRITE Customer
app.post('/customers', async (req, res) => {
    const { customerId, name, email } = req.body;
    try {
        await dynamoDb.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: { customerId, name, email }
        }));
        res.status(201).json({ message: 'Customer created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not create customer' });
    }
});

// READ Customer
app.get('/customers/:customerId', async (req, res) => {
    try {
        const { Item } = await dynamoDb.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { customerId: req.params.customerId }
        }));
        if (Item) {
            res.json(Item);
        } else {
            res.status(404).json({ error: 'Customer not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not retrieve customer' });
    }
});

// UPDATE Customer
app.put('/customers/:customerId', async (req, res) => {
    const { name, email } = req.body;
    try {
        await dynamoDb.send(new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { customerId: req.params.customerId },
            UpdateExpression: 'set #n = :name, email = :email',
            ExpressionAttributeNames: { '#n': 'name' }, // 'name' is a reserved word in DynamoDB, so we alias it
            ExpressionAttributeValues: {
                ':name': name,
                ':email': email
            }
        }));
        res.json({ message: 'Customer updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not update customer' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});