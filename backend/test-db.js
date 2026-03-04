const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function testConnection() {
    const uri = process.env.MONGODB_URI;
    console.log('Attempting to connect to:', uri.replace(/:([^@]+)@/, ':****@'));

    const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
    });

    try {
        await client.connect();
        console.log('✅ Successfully connected to MongoDB');
        const db = client.db('scholarsite');
        const collections = await db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));
    } catch (err) {
        console.error('❌ Connection failed:');
        console.error(err);
    } finally {
        await client.close();
    }
}

testConnection();
