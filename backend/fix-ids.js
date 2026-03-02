require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

async function fixMissingIds() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB\n');

        const db = client.db('scholarsite');

        const collections = [
            { name: 'scholarships', prefix: 'scholarship' },
            { name: 'services', prefix: 'service' },
            { name: 'team', prefix: 'team' },
            { name: 'blog', prefix: 'blog' },
            { name: 'faqs', prefix: 'faq' },
            { name: 'testimonials', prefix: 'testimonial' }
        ];

        let totalFixed = 0;

        for (const collection of collections) {
            // Find items without an 'id' field
            const itemsWithoutId = await db.collection(collection.name)
                .find({ id: { $exists: false } })
                .toArray();

            if (itemsWithoutId.length > 0) {
                console.log(`📋 ${collection.name}: Found ${itemsWithoutId.length} items without ID`);

                for (const item of itemsWithoutId) {
                    const newId = `${collection.prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                    await db.collection(collection.name).updateOne(
                        { _id: item._id },
                        { $set: { id: newId } }
                    );

                    console.log(`   ✅ Added ID: ${newId}`);
                    totalFixed++;
                }
            } else {
                console.log(`✅ ${collection.name}: All items have IDs`);
            }
        }

        console.log(`\n🎉 Fixed ${totalFixed} items total!\n`);

        // Verify by listing all scholarships
        const scholarships = await db.collection('scholarships').find().toArray();
        console.log('═══════════════════════════════════════');
        console.log(`   VERIFICATION: ${scholarships.length} scholarships`);
        console.log('═══════════════════════════════════════\n');

        scholarships.forEach((s, i) => {
            console.log(`${i + 1}. ${s.title}`);
            console.log(`   ID: ${s.id || '❌ MISSING'}`);
            console.log(`   _id: ${s._id}\n`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
        console.log('MongoDB connection closed');
    }
}

fixMissingIds();
