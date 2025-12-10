const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'iradukundagasangwa18@gmail.com',
        pass: 'gnuh cxbd wgxx jbuw'
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Generic file operations
async function readJSON(filename) {
    try {
        const filePath = path.join(__dirname, 'data', filename);
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filename}:`, error);
        return filename === 'mission.json' ? {} : [];
    }
}

async function writeJSON(filename, data) {
    try {
        const filePath = path.join(__dirname, 'data', filename);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error(`Error writing ${filename}:`, error);
        return false;
    }
}

// ========== SCHOLARSHIPS ==========
app.get('/api/scholarships', async (req, res) => {
    try {
        const data = await readJSON('scholarships.json');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch scholarships' });
    }
});

app.post('/api/scholarships', async (req, res) => {
    try {
        const items = await readJSON('scholarships.json');
        const newItem = { id: req.body.id || `scholarship-${Date.now()}`, ...req.body };
        items.push(newItem);
        const success = await writeJSON('scholarships.json', items);
        success ? res.status(201).json(newItem) : res.status(500).json({ error: 'Failed to save' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create scholarship' });
    }
});

app.delete('/api/scholarships/:id', async (req, res) => {
    try {
        const items = await readJSON('scholarships.json');
        const filtered = items.filter(item => item.id !== req.params.id);
        if (filtered.length === items.length) return res.status(404).json({ error: 'Not found' });
        const success = await writeJSON('scholarships.json', filtered);
        success ? res.json({ message: 'Deleted successfully' }) : res.status(500).json({ error: 'Failed to delete' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete scholarship' });
    }
});

// ========== SERVICES ==========
app.get('/api/services', async (req, res) => {
    try {
        const data = await readJSON('services.json');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

app.post('/api/services', async (req, res) => {
    try {
        const items = await readJSON('services.json');
        const newItem = { id: req.body.id || `service-${Date.now()}`, ...req.body };
        items.push(newItem);
        const success = await writeJSON('services.json', items);
        success ? res.status(201).json(newItem) : res.status(500).json({ error: 'Failed to save' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create service' });
    }
});

app.delete('/api/services/:id', async (req, res) => {
    try {
        const items = await readJSON('services.json');
        const filtered = items.filter(item => item.id !== req.params.id);
        if (filtered.length === items.length) return res.status(404).json({ error: 'Not found' });
        const success = await writeJSON('services.json', filtered);
        success ? res.json({ message: 'Deleted successfully' }) : res.status(500).json({ error: 'Failed to delete' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete service' });
    }
});

// ========== MISSION ==========
app.get('/api/mission', async (req, res) => {
    try {
        const data = await readJSON('mission.json');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch mission' });
    }
});

app.put('/api/mission', async (req, res) => {
    try {
        const success = await writeJSON('mission.json', req.body);
        success ? res.json(req.body) : res.status(500).json({ error: 'Failed to update mission' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update mission' });
    }
});

// ========== TEAM ==========
app.get('/api/team', async (req, res) => {
    try {
        const data = await readJSON('team.json');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch team' });
    }
});

app.post('/api/team', async (req, res) => {
    try {
        const items = await readJSON('team.json');
        const newItem = { id: req.body.id || `team-${Date.now()}`, ...req.body };
        items.push(newItem);
        const success = await writeJSON('team.json', items);
        success ? res.status(201).json(newItem) : res.status(500).json({ error: 'Failed to save' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create team member' });
    }
});

app.delete('/api/team/:id', async (req, res) => {
    try {
        const items = await readJSON('team.json');
        const filtered = items.filter(item => item.id !== req.params.id);
        if (filtered.length === items.length) return res.status(404).json({ error: 'Not found' });
        const success = await writeJSON('team.json', filtered);
        success ? res.json({ message: 'Deleted successfully' }) : res.status(500).json({ error: 'Failed to delete' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete team member' });
    }
});

// ========== BLOG ==========
app.get('/api/blog', async (req, res) => {
    try {
        const data = await readJSON('blog.json');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
});

app.post('/api/blog', async (req, res) => {
    try {
        const items = await readJSON('blog.json');
        const newItem = { id: req.body.id || `blog-${Date.now()}`, ...req.body };
        items.push(newItem);
        const success = await writeJSON('blog.json', items);
        success ? res.status(201).json(newItem) : res.status(500).json({ error: 'Failed to save' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create blog post' });
    }
});

app.delete('/api/blog/:id', async (req, res) => {
    try {
        const items = await readJSON('blog.json');
        const filtered = items.filter(item => item.id !== req.params.id);
        if (filtered.length === items.length) return res.status(404).json({ error: 'Not found' });
        const success = await writeJSON('blog.json', filtered);
        success ? res.json({ message: 'Deleted successfully' }) : res.status(500).json({ error: 'Failed to delete' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete blog post' });
    }
});

// ========== FAQS ==========
app.get('/api/faqs', async (req, res) => {
    try {
        const data = await readJSON('faqs.json');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch FAQs' });
    }
});

app.post('/api/faqs', async (req, res) => {
    try {
        const items = await readJSON('faqs.json');
        const newItem = { id: req.body.id || `faq-${Date.now()}`, ...req.body };
        items.push(newItem);
        const success = await writeJSON('faqs.json', items);
        success ? res.status(201).json(newItem) : res.status(500).json({ error: 'Failed to save' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create FAQ' });
    }
});

app.delete('/api/faqs/:id', async (req, res) => {
    try {
        const items = await readJSON('faqs.json');
        const filtered = items.filter(item => item.id !== req.params.id);
        if (filtered.length === items.length) return res.status(404).json({ error: 'Not found' });
        const success = await writeJSON('faqs.json', filtered);
        success ? res.json({ message: 'Deleted successfully' }) : res.status(500).json({ error: 'Failed to delete' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete FAQ' });
    }
});

// ========== TESTIMONIALS / SUCCESS STORIES ==========
app.get('/api/testimonials', async (req, res) => {
    try {
        const data = await readJSON('testimonials.json');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch testimonials' });
    }
});

app.post('/api/testimonials', async (req, res) => {
    try {
        const items = await readJSON('testimonials.json');
        const newItem = { id: req.body.id || `testimonial-${Date.now()}`, ...req.body };
        items.push(newItem);
        const success = await writeJSON('testimonials.json', items);
        success ? res.status(201).json(newItem) : res.status(500).json({ error: 'Failed to save' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create testimonial' });
    }
});

app.delete('/api/testimonials/:id', async (req, res) => {
    try {
        const items = await readJSON('testimonials.json');
        const filtered = items.filter(item => item.id !== req.params.id);
        if (filtered.length === items.length) return res.status(404).json({ error: 'Not found' });
        const success = await writeJSON('testimonials.json', filtered);
        success ? res.json({ message: 'Deleted successfully' }) : res.status(500).json({ error: 'Failed to delete' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete testimonial' });
    }
});

// ========== CONTACT FORM EMAIL ==========
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Email to company
        const mailOptions = {
            from: 'emmanuelsab88@gmail.com',
            to: 'emmanuelsab88@gmail.com',
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

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📚 Managing: Scholarships, Services, Mission, Team, Blog, FAQs, Testimonials`);
    console.log(`📧 Email: Contact form enabled`);
});
