require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

async function listScholarships() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        const db = client.db('scholarsite');

        const scholarships = await db.collection('scholarships').find().toArray();

        console.log(`\n════════════════════════════════════════`);
        console.log(`   TOTAL SCHOLARSHIPS: ${scholarships.length}`);
        console.log(`════════════════════════════════════════\n`);

        scholarships.forEach((scholarship, index) => {
            console.log(`${index + 1}. ${scholarship.title}`);
            console.log(`   ID: ${scholarship.id || 'N/A'}`);
            console.log(`   MongoDB _id: ${scholarship._id}`);
            console.log(`   Country: ${scholarship.country}`);
            console.log(`   Degree: ${scholarship.degree}`);
            console.log(`   Deadline: ${scholarship.deadline}`);
            if (scholarship.createdAt) {
                console.log(`   Created: ${new Date(scholarship.createdAt).toLocaleString()}`);
            }
            console.log(`   ────────────────────────────────────\n`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

listScholarships();
