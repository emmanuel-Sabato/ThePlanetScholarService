const fs = require('fs').promises;
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function migrateData() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db('scholarsite');

        // Read all JSON files
        const dataFiles = [
            'scholarships.json',
            'services.json',
            'mission.json',
            'team.json',
            'blog.json',
            'faqs.json',
            'testimonials.json'
        ];

        for (const file of dataFiles) {
            const collectionName = file.replace('.json', '');
            const filePath = path.join(__dirname, 'data', file);

            try {
                const fileData = await fs.readFile(filePath, 'utf8');
                const data = JSON.parse(fileData);

                // Clear existing data
                await db.collection(collectionName).deleteMany({});

                // Insert data
                if (file === 'mission.json') {
                    // Mission is a single object
                    if (data && Object.keys(data).length > 0) {
                        await db.collection(collectionName).insertOne(data);
                        console.log(`✅ Migrated ${collectionName}: 1 document`);
                    }
                } else {
                    // All others are arrays
                    if (Array.isArray(data) && data.length > 0) {
                        await db.collection(collectionName).insertMany(data);
                        console.log(`✅ Migrated ${collectionName}: ${data.length} documents`);
                    }
                }
            } catch (error) {
                console.error(`❌ Error migrating ${file}:`, error.message);
            }
        }

        console.log('\n🎉 Migration complete!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await client.close();
        console.log('MongoDB connection closed');
    }
}

migrateData();
