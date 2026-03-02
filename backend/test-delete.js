require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

// Test deleting scholarship #3: "ahjgkaHFGAHSFDJ"
const testId = 'scholarship-1765381837743-5fi17xov3';

async function testDelete() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        const db = client.db('scholarsite');

        console.log(`Testing delete for ID: ${testId}\n`);

        // Try to find it first
        const item = await db.collection('scholarships').findOne({ id: testId });
        if (item) {
            console.log('✅ Found item:');
            console.log(`   Title: ${item.title}`);
            console.log(`   ID: ${item.id}`);
            console.log(`   _id: ${item._id}\n`);

            // Now try to delete it
            const result = await db.collection('scholarships').deleteOne({ id: testId });

            if (result.deletedCount > 0) {
                console.log('🎉 Successfully deleted!\n');
            } else {
                console.log('❌ Delete failed - no items matched\n');
            }

            // Verify it's gone
            const check = await db.collection('scholarships').findOne({ id: testId });
            if (check) {
                console.log('⚠️ Item still exists!');
            } else {
                console.log('✅ Verified - item is deleted');
            }
        } else {
            console.log('❌ Item not found with that ID');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

testDelete();
