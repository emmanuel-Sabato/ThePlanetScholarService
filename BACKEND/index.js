require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
let db;
let client;

async function connectDB() {
    try {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        db = client.db('scholarsite');
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'iradukundagasangwa18@gmail.com',
        pass: process.env.EMAIL_PASS || 'gnuh cxbd wgxx jbuw'
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// ========== SCHOLARSHIPS ==========
app.get('/api/scholarships', async (req, res) => {
    try {
        const items = await db.collection('scholarships').find().toArray();
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch scholarships' });
    }
});

app.post('/api/scholarships', async (req, res) => {
    try {
        const newItem = { ...req.body, createdAt: new Date() };
        const result = await db.collection('scholarships').insertOne(newItem);
        res.status(201).json({ ...newItem, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create scholarship' });
    }
});

app.delete('/api/scholarships/:id', async (req, res) => {
    try {
        const result = await db.collection('scholarships').deleteOne({ id: req.params.id });
        result.deletedCount > 0
            ? res.json({ message: 'Deleted successfully' })
            : res.status(404).json({ error: 'Not found' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete scholarship' });
    }
});

// ========== SERVICES ==========
app.get('/api/services', async (req, res) => {
    try {
        const items = await db.collection('services').find().toArray();
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

app.post('/api/services', async (req, res) => {
    try {
        const newItem = { ...req.body, createdAt: new Date() };
        const result = await db.collection('services').insertOne(newItem);
        res.status(201).json({ ...newItem, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create service' });
    }
});

app.delete('/api/services/:id', async (req, res) => {
    try {
        const result = await db.collection('services').deleteOne({ id: req.params.id });
        result.deletedCount > 0
            ? res.json({ message: 'Deleted successfully' })
            : res.status(404).json({ error: 'Not found' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete service' });
    }
});

// ========== MISSION ==========
app.get('/api/mission', async (req, res) => {
    try {
        const item = await db.collection('mission').findOne();
        res.json(item || { title: '', content: '' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch mission' });
    }
});

app.put('/api/mission', async (req, res) => {
    try {
        await db.collection('mission').deleteMany({});
        const result = await db.collection('mission').insertOne(req.body);
        res.json({ ...req.body, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update mission' });
    }
});

// ========== TEAM ==========
app.get('/api/team', async (req, res) => {
    try {
        const items = await db.collection('team').find().toArray();
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch team' });
    }
});

app.post('/api/team', async (req, res) => {
    try {
        const newItem = { ...req.body, createdAt: new Date() };
        const result = await db.collection('team').insertOne(newItem);
        res.status(201).json({ ...newItem, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create team member' });
    }
});

app.delete('/api/team/:id', async (req, res) => {
    try {
        const result = await db.collection('team').deleteOne({ id: req.params.id });
        result.deletedCount > 0
            ? res.json({ message: 'Deleted successfully' })
            : res.status(404).json({ error: 'Not found' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete team member' });
    }
});

// ========== BLOG ==========
app.get('/api/blog', async (req, res) => {
    try {
        const items = await db.collection('blog').find().toArray();
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
});

app.post('/api/blog', async (req, res) => {
    try {
        const newItem = { ...req.body, createdAt: new Date() };
        const result = await db.collection('blog').insertOne(newItem);
        res.status(201).json({ ...newItem, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create blog post' });
    }
});

app.delete('/api/blog/:id', async (req, res) => {
    try {
        const result = await db.collection('blog').deleteOne({ id: req.params.id });
        result.deletedCount > 0
            ? res.json({ message: 'Deleted successfully' })
            : res.status(404).json({ error: 'Not found' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete blog post' });
    }
});

// ========== FAQS ==========
app.get('/api/faqs', async (req, res) => {
    try {
        const items = await db.collection('faqs').find().toArray();
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch FAQs' });
    }
});

app.post('/api/faqs', async (req, res) => {
    try {
        const newItem = { ...req.body, createdAt: new Date() };
        const result = await db.collection('faqs').insertOne(newItem);
        res.status(201).json({ ...newItem, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create FAQ' });
    }
});

app.delete('/api/faqs/:id', async (req, res) => {
    try {
        const result = await db.collection('faqs').deleteOne({ id: req.params.id });
        result.deletedCount > 0
            ? res.json({ message: 'Deleted successfully' })
            : res.status(404).json({ error: 'Not found' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete FAQ' });
    }
});

// ========== TESTIMONIALS ==========
app.get('/api/testimonials', async (req, res) => {
    try {
        const items = await db.collection('testimonials').find().toArray();
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch testimonials' });
    }
});

app.post('/api/testimonials', async (req, res) => {
    try {
        const newItem = { ...req.body, createdAt: new Date() };
        const result = await db.collection('testimonials').insertOne(newItem);
        res.status(201).json({ ...newItem, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create testimonial' });
    }
});

app.delete('/api/testimonials/:id', async (req, res) => {
    try {
        const result = await db.collection('testimonials').deleteOne({ id: req.params.id });
        result.deletedCount > 0
            ? res.json({ message: 'Deleted successfully' })
            : res.status(404).json({ error: 'Not found' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete testimonial' });
    }
});

// ========== CONTACT FORM EMAIL ==========
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER || 'iradukundagasangwa18@gmail.com',
            to: process.env.EMAIL_USER || 'iradukundagasangwa18@gmail.com',
            subject: `Contact Form: ${subject}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
                <hr>
                <p><em>Reply to: ${email}</em></p>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

// Start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
        console.log(`📚 Managing: Scholarships, Services, Mission, Team, Blog, FAQs, Testimonials`);
        console.log(`📧 Email: Contact form enabled`);
    });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await client.close();
    console.log('MongoDB connection closed');
    process.exit(0);
});
