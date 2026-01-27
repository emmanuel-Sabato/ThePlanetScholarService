require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const archiver = require('archiver');
const https = require('https');
const http = require('http');
const { GoogleGenerativeAI } = require('@google/generative-ai');


const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
let db;
const client = new MongoClient(MONGODB_URI, {
    family: 4,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 60000,
    serverSelectionTimeoutMS: 20000,
});

async function connectDB() {
    try {
        await client.connect();
        db = client.db('scholarsite');
        console.log('✅ Connected to MongoDB');

        // System initialization guard
        const settings = db.collection('system_settings');
        const initFlag = await settings.findOne({ key: 'is_initialized' });

        if (!initFlag) {
            console.log('🚀 System not initialized. Running first-time setup...');
            await seedUsers();
            await seedEnrollmentCategories();
            await seedScholarships();
            await seedServices();
            await seedTeam();
            await seedBlog();

            await settings.insertOne({ key: 'is_initialized', value: true, timestamp: new Date() });
            console.log('✅ System initialization complete.');
        } else {
            console.log('🛡️ System already initialized. Skipping auto-seeding.');
        }
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

// Seeding Users (Admin)
async function seedUsers() {
    const usersCollection = db.collection('users');
    const count = await usersCollection.countDocuments();

    if (count === 0) {
        console.log('🌱 Seeding Default Admin User...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const adminUser = {
            name: 'System Admin',
            email: 'admin@gmail.com',
            password: hashedPassword,
            role: 'admin',
            createdAt: new Date()
        };
        await usersCollection.insertOne(adminUser);
        console.log('✅ Default Admin User created: admin@gmail.com / admin123');
    }
}

// Seeding Scholarships (Universities)
async function seedScholarships() {
    const scholarshipsCollection = db.collection('scholarships');
    const count = await scholarshipsCollection.countDocuments();

    // Only seed if empty. The global guard in connectDB handles "first-time" logic.
    if (count === 0) {
        console.log('🌱 Seeding initial Scholarships...');
        const scholarships = [];

        // Helper to create 4 universities per sub-category
        const addUnis = (category, subCategory, unis) => {
            unis.forEach(uni => {
                scholarships.push({
                    id: `scholarship-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    title: `${subCategory} at ${uni.name}`,
                    university: uni.name,
                    location: uni.location,
                    country: "China",
                    degree: "Non-Degree",
                    field: "General",
                    deadline: "2030-12-31",
                    description: `Experience the ${subCategory} at ${uni.name}. This program offers a unique opportunity to study in ${uni.location}.`,
                    eligibility: "Open to international students.",
                    benefits: "Full tuition waiver and accommodation.",
                    image: "", // Placeholder or default
                    programMode: "On-Campus",
                    programType: "Full-time",
                    language: "English",
                    category: category,
                    subCategory: subCategory,
                    tuition: "Free",
                    duration: "1 Year",
                    fastTrack: false,
                    isPromoted: false,
                    createdAt: new Date()
                });
            });
        };

        // --- Populating Data based on Enrollment Categories ---

        // 1. Short-Term Program
        addUnis("Short-Term Program", "哈尔滨青年冰雪创新体验营 Harbin Youth Ice Innovation Experience Camp", [
            { name: "Harbin Engineering University", location: "Harbin" },
            { name: "Harbin Institute of Technology", location: "Harbin" },
            { name: "Northeast Forestry University", location: "Harbin" },
            { name: "Heilongjiang University", location: "Harbin" }
        ]);

        addUnis("Short-Term Program", "“中泰一家亲”2025年第一期 SINO-Thai 202510", [
            { name: "Chiang Mai University", location: "Chiang Mai" },
            { name: "Chulalongkorn University", location: "Bangkok" },
            { name: "Harbin Engineering University", location: "Harbin" },
            { name: "Mahidol University", location: "Bangkok" }
        ]);

        addUnis("Short-Term Program", "HEU冬令营 HEU Winter Camp", [
            { name: "Harbin Engineering University", location: "Harbin" },
            { name: "Ocean University of China", location: "Qingdao" },
            { name: "Dalian Maritime University", location: "Dalian" },
            { name: "Wuhan University of Technology", location: "Wuhan" }
        ]);

        addUnis("Short-Term Program", "“中泰一家亲”2025年第二期 Sino-Thai 202511", [
            { name: "Prince of Songkla University", location: "Songkhla" },
            { name: "Burapha University", location: "Chonburi" },
            { name: "Harbin Engineering University", location: "Harbin" },
            { name: "Khon Kaen University", location: "Khon Kaen" }
        ]);

        // Add a few more examples for other categories just to have data
        addUnis("Self-funded Pre-University Program", "Self-funded Pre-University Program", [
            { name: "Zhejiang University", location: "Hangzhou" },
            { name: "Fudan University", location: "Shanghai" },
            { name: "Nanjing University", location: "Nanjing" },
            { name: "Tsinghua University", location: "Beijing" }
        ]);

        addUnis("Self-funded Chinese Language Program", "Self-funded Chinese Language Program", [
            { name: "Beijing Language and Culture University", location: "Beijing" },
            { name: "Shanghai International Studies University", location: "Shanghai" },
            { name: "Heilongjiang University", location: "Harbin" },
            { name: "Harbin Normal University", location: "Harbin" }
        ]);

        // More Short-Term Programs
        addUnis("Short-Term Program", "哈尔滨工程大学-圣·约瑟夫空沙旺学校人工智能体验营 HARBIN ENGINEERING UNIVERSITY-SAINT JOSEPH NAKHONSAWAN SCHOOL AI WINTER CAMP", [
            { name: "Harbin Engineering University", location: "Harbin" },
            { name: "Saint Joseph Nakhonsawan School", location: "Nakhonsawan" },
            { name: "Harbin Institute of Technology", location: "Harbin" },
            { name: "Heilongjiang University", location: "Harbin" }
        ]);

        addUnis("Short-Term Program", "烟台研究院暑期学校 Summer School of YAN TAI Research Institute", [
            { name: "Yantai University", location: "Yantai" },
            { name: "Harbin Engineering University (Yantai Campus)", location: "Yantai" },
            { name: "Ludong University", location: "Yantai" },
            { name: "Shandong University", location: "Jinan" }
        ]);

        addUnis("Short-Term Program", "诗琳通公主奖学金 Sirindhorn Scholarship", [
            { name: "Peking University", location: "Beijing" },
            { name: "Wuhan University", location: "Wuhan" },
            { name: "Shandong University", location: "Jinan" },
            { name: "Xiamen University", location: "Xiamen" }
        ]);

        addUnis("Short-Term Program", "核学院暑期学校 Summer School of Nuclear Science", [
            { name: "Harbin Engineering University", location: "Harbin" },
            { name: "Tsinghua University", location: "Beijing" },
            { name: "Xi'an Jiaotong University", location: "Xi'an" },
            { name: "University of Science and Technology of China", location: "Hefei" }
        ]);

        addUnis("Short-Term Program", "动力国际暑期营 Power International Summer Camp项目介绍/Introduction", [
            { name: "Harbin Engineering University", location: "Harbin" },
            { name: "Shanghai Jiao Tong University", location: "Shanghai" },
            { name: "Tianjin University", location: "Tianjin" },
            { name: "Huazhong University of Science and Technology", location: "Wuhan" }
        ]);

        addUnis("Short-Term Program", "智能工程国际暑期学校 Summer School of Intelligent Control项目介绍/Introduction", [
            { name: "Harbin Engineering University", location: "Harbin" },
            { name: "Beihang University", location: "Beijing" },
            { name: "Northeastern University", location: "Shenyang" },
            { name: "Southeast University", location: "Nanjing" }
        ]);

        addUnis("Short-Term Program", "材化学院国际暑期学校 Summer School of Material Science and Chemical Engineering", [
            { name: "Harbin Engineering University", location: "Harbin" },
            { name: "Tianjin University", location: "Tianjin" },
            { name: "Beijing University of Chemical Technology", location: "Beijing" },
            { name: "East China University of Science and Technology", location: "Shanghai" }
        ]);

        addUnis("Short-Term Program", "YES项目 YES Program", [
            { name: "China Foreign Affairs University", location: "Beijing" },
            { name: "Beijing International Studies University", location: "Beijing" },
            { name: "Shanghai International Studies University", location: "Shanghai" },
            { name: "Guangdong University of Foreign Studies", location: "Guangzhou" }
        ]);

        addUnis("Short-Term Program", "计算机学院国际暑期学校 Summer School of Computer Science and Technology", [
            { name: "Harbin Engineering University", location: "Harbin" },
            { name: "Zhejiang University", location: "Hangzhou" },
            { name: "Nanjing University", location: "Nanjing" },
            { name: "University of Electronic Science and Technology of China", location: "Chengdu" }
        ]);

        addUnis("Short-Term Program", "物理学院国际暑期学校 Summer School of Physics", [
            { name: "Harbin Engineering University", location: "Harbin" },
            { name: "Peking University", location: "Beijing" },
            { name: "Nanjing University", location: "Nanjing" },
            { name: "Fudan University", location: "Shanghai" }
        ]);

        // Exchange Programme
        addUnis("Exchange Programme", "校际交流交换项目 University Exchange and Visiting Programs", [
            { name: "Peking University", location: "Beijing" },
            { name: "Tsinghua University", location: "Beijing" },
            { name: "Fudan University", location: "Shanghai" },
            { name: "Shanghai Jiao Tong University", location: "Shanghai" }
        ]);

        // Chinese Government Scholarship
        addUnis("Chinese Government Scholarship", "中国政府奖学金 Chinese Government Scholarship", [
            { name: "Zhejiang University", location: "Hangzhou" },
            { name: "Wuhan University", location: "Wuhan" },
            { name: "Huazhong University of Science and Technology", location: "Wuhan" },
            { name: "Sun Yat-sen University", location: "Guangzhou" }
        ]);

        // International Chinese Language Teachers Scholarship
        addUnis("International Chinese Language Teachers Scholarship", "泰国清迈教联高级中学四周学习项目 Four-week-study program for Jiaolian Language School", [
            { name: "Yunnan Normal University", location: "Kunming" },
            { name: "Guangxi University", location: "Nanning" },
            { name: "Harbin Engineering University", location: "Harbin" },
            { name: "Chiang Mai University", location: "Chiang Mai" }
        ]);

        addUnis("International Chinese Language Teachers Scholarship", "汉语进修项目 Chinese Language Program", [
            { name: "Beijing Normal University", location: "Beijing" },
            { name: "East China Normal University", location: "Shanghai" },
            { name: "Northeast Normal University", location: "Changchun" },
            { name: "Shaanxi Normal University", location: "Xi'an" }
        ]);

        // Harbin Engineering University Scholarship
        addUnis("Harbin Engineering University Scholarship", "HEU奖学金 HEU Scholarship项目介绍/Introduction", [
            { name: "Harbin Engineering University", location: "Harbin" },
            { name: "Harbin Engineering University", location: "Harbin" },
            { name: "Harbin Engineering University", location: "Harbin" },
            { name: "Harbin Engineering University", location: "Harbin" }
        ]);

        // Foreign Government Scholarship
        addUnis("Foreign Government Scholarship", "外国政府奖学金 Foreign Government Scholarship", [
            { name: "China Agricultural University", location: "Beijing" },
            { name: "Beihang University", location: "Beijing" },
            { name: "Beijing Institute of Technology", location: "Beijing" },
            { name: "Tongji University", location: "Shanghai" }
        ]);

        // Corporate Scholarship
        addUnis("Corporate Scholarship", "船贸委培项目 Company Fund Program", [
            { name: "Dalian Maritime University", location: "Dalian" },
            { name: "Shanghai Maritime University", location: "Shanghai" },
            { name: "Wuhan University of Technology", location: "Wuhan" },
            { name: "Harbin Engineering University", location: "Harbin" }
        ]);

        // Self-funded Graduate Program
        addUnis("Self-funded Graduate Program", "自费研究生项目 Self-funded Graduate Program项目介绍/Introduction", [
            { name: "Tsinghua University", location: "Beijing" },
            { name: "Peking University", location: "Beijing" },
            { name: "Zhejiang University", location: "Hangzhou" },
            { name: "Shanghai Jiao Tong University", location: "Shanghai" }
        ]);

        // Self-funded Undergraduate Program
        addUnis("Self-funded Undergraduate Program", "自费本科生项目 Self-funded Undergraduate Program", [
            { name: "Fudan University", location: "Shanghai" },
            { name: "Nanjing University", location: "Nanjing" },
            { name: "University of Science and Technology of China", location: "Hefei" },
            { name: "Harbin Institute of Technology", location: "Harbin" }
        ]);

        if (scholarships.length > 0) {
            await scholarshipsCollection.insertMany(scholarships);
            console.log(`🌱 Seeded ${scholarships.length} Scholarships`);
        }
    }
}

// Seeding Default Categories
async function seedEnrollmentCategories() {
    try {
        const categoriesCollection = db.collection('enrollment_categories');
        const count = await categoriesCollection.countDocuments();

        // Check if existing data needs migration (object-based to string-based)
        const sample = await categoriesCollection.findOne();
        const needsReseed = sample && sample.subCategories && sample.subCategories.length > 0 && typeof sample.subCategories[0] === 'object';

        if (count === 0 || needsReseed) {
            if (needsReseed) {
                console.log('🔄 Detected object-based sub-categories. Clearing to re-seed with strings...');
                await categoriesCollection.deleteMany({});
            } else {
                console.log('🌱 No enrollment categories found. Seeding...');
            }

            const categories = [
                {
                    name: "Non-degree Chinese Language Program",
                    subCategories: ["General Chinese Language", "Intensive Chinese Language", "Business Chinese", "Summer/Winter Camp"]
                },
                {
                    name: "Bachelor's Degree Program",
                    subCategories: ["Engineering", "Business & Economics", "Medicine", "Social Sciences", "Arts & Humanities", "Natural Sciences"]
                },
                {
                    name: "Master's Degree Program",
                    subCategories: ["MBA/Management", "Technology", "Public Policy", "International Relations", "Education", "Law"]
                },
                {
                    name: "Doctoral Degree Program",
                    subCategories: ["Advanced Research", "Engineering & Tech", "Clinical Medicine", "Fundamental Sciences", "Economics"]
                },
                {
                    name: "Short-Term Program",
                    subCategories: ["Cultural Exchange", "Enterprise Visit", "Research Internship", "Language Immersion"]
                },
                {
                    name: "Self-funded Pre-University Program",
                    subCategories: ["IFP (International Foundation Program)", "University Bridge", "HSK Preparation"]
                }
            ];
            await categoriesCollection.insertMany(categories);
            console.log('✅ Enrollment categories seeded successfully');
        }
    } catch (error) {
        console.error('❌ Error seeding enrollment categories:', error);
    }
}

async function seedServices() {
    try {
        const collection = db.collection('services');
        const count = await collection.countDocuments();
        if (count === 0) {
            console.log('🌱 Seeding Services...');
            const services = [
                {
                    title: "Discovery Call",
                    icon: "Target",
                    description: "Map your profile and target scholarships that match your goals.",
                    id: "service-1",
                    createdAt: new Date()
                },
                {
                    title: "Timeline Planning",
                    icon: "Smartphone",
                    description: "Deadlines, document list, and recommendation strategy.",
                    id: "service-2",
                    createdAt: new Date()
                },
                {
                    title: "Essay Coaching",
                    icon: "FileEdit",
                    description: "Sessions with edits and reviewer feedback.",
                    id: "service-3",
                    createdAt: new Date()
                },
                {
                    title: "Visa Preparation",
                    icon: "Plane",
                    description: "Documentation review and interview rehearsal.",
                    id: "service-4",
                    createdAt: new Date()
                }
            ];
            await collection.insertMany(services);
            console.log('✅ Services seeded');
        }
    } catch (e) { console.error('Error seeding services:', e); }
}

async function seedTeam() {
    try {
        const collection = db.collection('team');
        const count = await collection.countDocuments();
        if (count === 0) {
            console.log('🌱 Seeding Team...');
            const team = [
                {
                    name: "Dr. Elena Chen",
                    role: "Director of Global Admissions",
                    bio: "Former scholarship board member with 15 years of experience in international education.",
                    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&h=200&fit=crop",
                    id: "team-1",
                    createdAt: new Date()
                },
                {
                    name: "Marcus Thorne",
                    role: "Senior Scholarship Advisor",
                    bio: "Specializes in Ivy League and European governmental grants.",
                    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&fit=crop",
                    id: "team-2",
                    createdAt: new Date()
                },
                {
                    name: "Sarah Jenkins",
                    role: "Visa & Logistics Specialist",
                    bio: "Expert in student visa documentation for 30+ countries.",
                    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&h=200&fit=crop",
                    id: "team-3",
                    createdAt: new Date()
                }
            ];
            await collection.insertMany(team);
            console.log('✅ Team seeded');
        }
    } catch (e) { console.error('Error seeding team:', e); }
}

async function seedBlog() {
    try {
        const collection = db.collection('blog');
        const count = await collection.countDocuments();
        if (count === 0) {
            console.log('🌱 Seeding Blog...');
            const posts = [
                {
                    title: "Top 10 Fully Funded Scholarships for 2025",
                    excerpt: "Discover the most prestigious awards that cover tuition, housing, and travel.",
                    author: "Elena Chen",
                    date: "Jan 15, 2025",
                    content: "Selecting the right scholarship can change your life. In this post, we look at the top global opportunities for the upcoming academic year...",
                    id: "blog-1",
                    createdAt: new Date()
                },
                {
                    title: "How to Write a Winning Personal Statement",
                    excerpt: "Our experts break down the anatomy of a successful scholarship essay.",
                    author: "Marcus Thorne",
                    date: "Jan 10, 2025",
                    content: "Your personal statement is your chance to shine. Focus on your unique journey and how this scholarship aligns with your future impact...",
                    id: "blog-2",
                    createdAt: new Date()
                },
                {
                    title: "Navigating the F-1 Student Visa Process",
                    excerpt: "Everything you need to know for your US university visa interview.",
                    author: "Sarah Jenkins",
                    date: "Jan 05, 2025",
                    content: "The visa interview is the final hurdle. Stay calm, be honest about your intentions, and ensure all your financial documents are in order...",
                    id: "blog-3",
                    createdAt: new Date()
                }
            ];
            await collection.insertMany(posts);
            console.log('✅ Blog seeded');
        }
    } catch (e) { console.error('Error seeding blog:', e); }
}

// Email configuration (Brevo SMTP - formerly Sendinblue)
const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, // port 587 uses STARTTLS
    auth: {
        user: '9fd744001@smtp-brevo.com', // Your Brevo SMTP Login
        pass: process.env.SMTP_KEY || process.env.API_KEY // Use SMTP Key, fallback to API Key
    }
});

/**
 * Helper to send email using the SMTP transporter
 * @param {string} to Receiver email
 * @param {string} subject Email subject
 * @param {string} htmlContent Email body (HTML)
 */
const sendSystemEmail = async (to, subject, htmlContent) => {
    try {
        const senderAddress = process.env.EMAIL_USER || '9fd744001@smtp-brevo.com';
        const info = await transporter.sendMail({
            from: `"The Planet Scholar" <${senderAddress}>`,
            to,
            subject,
            html: htmlContent
        });
        console.log(`[Email Success] Email sent via Brevo SMTP: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`[Email Error] Brevo SMTP failed for ${to}:`, error.message);
        throw error; // Throw so the caller can catch and report specific details
    }
};

// Middleware
app.set('trust proxy', true);
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://theplanetscholarservice.vercel.app',
        'https://backend-tau-lime-64.vercel.app'
    ],
    credentials: true
}));
app.use(express.json());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'scholarsite-secret-key',
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({
        client: client,
        dbName: 'scholarsite',
        collectionName: 'sessions',
        ttl: 24 * 60 * 60 // 1 day
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        secure: true, // Always true for cross-site SameSite: none
        sameSite: 'none'
    }
}));


const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer Configuration (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ========== ENROLLMENT CATEGORIES ==========
app.get('/api/enrollment-categories', async (req, res) => {
    try {
        const items = await db.collection('enrollment_categories').find().toArray();
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

app.post('/api/enrollment-categories', async (req, res) => {
    try {
        const newItem = req.body;
        const result = await db.collection('enrollment_categories').insertOne(newItem);
        res.status(201).json({ ...newItem, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create category' });
    }
});

app.put('/api/enrollment-categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedItem = req.body;
        delete updatedItem._id;
        await db.collection('enrollment_categories').updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedItem }
        );
        res.json({ message: 'Category updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update category' });
    }
});

app.delete('/api/enrollment-categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('enrollment_categories').deleteOne({ _id: new ObjectId(id) });
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

// ========== AI CHATBOT ==========
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            return res.status(500).json({ error: 'Gemini API Key not configured by admin' });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: `You are the official AI assistant for "The Planet Scholar Service", a premium scholarship consultancy. 
            Your goal is to help public users understand our services and guide them through their scholarship journey.

            **Core Identity & Mission:**
            - Site Name: The Planet Scholar Service (also known as P2S or TheP2S).
            - Slogan: "Find Your Perfect Scholarship - Start Your Journey Today".
            - Mission: To empower students to achieve their academic dreams through expert guidance, application support, and visa assistance.
            - Values: We believe access to education should be global and verified.

            **Key Statistics (Success & Trust):**
            - Success Rate: 92%.
            - Students Helped: Over 10,000+ students.
            - Countries Served: 50+ countries worldwide.
            - Scholarships Tracked: 2,500+ handpicked and verified opportunities.
            - Essays Reviewed: 1,200+ essays polished for success.

            **Our Services (Search to Visa):**
            - Discovery Call: Profile mapping and identification of target scholarships that match student goals.
            - Timeline Planning: Crafting a precise strategy for deadlines, document collection, and recommendations.
            - Essay Coaching: Narrative development and detailed edits for personal statements to ensure clarity and impact.
            - Visa Preparation: Interview rehearsals and document reviews for a smooth travel process.
            - Application Guidance: A tailored plan with weekly check-ins to stay on track.

            **How to Apply / Get Started:**
            - Users can browse scholarships by "Country", "Field of study", and "Degree level" on the homepage.
            - Direct Link for Help: Suggest users "Book a Consultation" or "Get Expert Help" via the contact/services pages.

            **Contact Information:**
            - Email: iradukundagasangwa18@gmail.com
            - Phone: +250 781 306 944
            - Instagram: @thep2s_apply_ltd
            - Response Time: We typically reply within 1 business day.

            **Enrollment Categories:**
            - Non-degree Chinese Language Programs (General, Intensive, Business, Camps)
            - Degree Programs (Bachelor's, Master's, Doctoral) in Engineering, Business, Medicine, etc.
            - Short-Term Exchange & Research Internships.
            - Self-funded Pre-University Programs (IFP, HSK Prep).

            **Style Guidelines:**
            - Professional, welcoming, and encouraging ("The Expert Guide").
            - Keep responses concise but helpful. Use bullet points for lists.
            - If a user asks a highly specific or urgent question, suggest booking a "Discovery Call" or emailing us.
            - Act as a knowledgeable member of the P2S team. Do not say "I am an AI" unless explicitly asked.
            - Prioritize student success and encouragement.`
        });

        const chat = model.startChat({
            history: history || [],
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ text });
    } catch (error) {
        console.error('[ChatDebug v3] Gemini API Error details:', {
            message: error.message,
            stack: error.stack,
            status: error.status
        });
        res.status(500).json({
            error: 'Failed to get response from AI assistant [v3]',
            details: error.message
        });
    }
});



// ========== SCHOLARSHIPS ==========

app.get('/api/scholarships', async (req, res) => {
    try {
        const items = await db.collection('scholarships').find().toArray();
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch scholarships' });
    }
});

// ========== FILE UPLOAD ==========
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Upload to Cloudinary
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

        const uploadResponse = await cloudinary.uploader.upload(dataURI, {
            folder: 'applications',
            resource_type: 'auto'
        });

        res.json({
            url: uploadResponse.secure_url,
            originalName: req.file.originalname,
            mimetype: req.file.mimetype
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            error: 'Failed to upload file',
            details: error.message,
            cloudinaryError: error
        });
    }
});

app.post('/api/scholarships', upload.single('image'), async (req, res) => {
    try {
        console.log('Received scholarship creation request');
        console.log('Body:', req.body);
        console.log('File:', req.file ? 'File present' : 'No file');

        let imageUrl = '';

        if (req.file) {
            console.log('Attempting Cloudinary upload...');
            // Upload to Cloudinary
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
            const uploadResponse = await cloudinary.uploader.upload(dataURI, {
                folder: 'scholarships',
                resource_type: 'auto'
            });
            console.log('Cloudinary upload success:', uploadResponse.secure_url);
            imageUrl = uploadResponse.secure_url;
        } else if (req.body.image) {
            // Fallback if URL is provided directly (legacy support)
            imageUrl = req.body.image;
        }

        const newItem = {
            ...req.body,
            image: imageUrl,
            id: req.body.id || `scholarship-${Date.now()}`,
            createdAt: new Date()
        };
        const result = await db.collection('scholarships').insertOne(newItem);
        console.log('Database insertion success');
        res.status(201).json({ ...newItem, _id: result.insertedId });
    } catch (error) {
        console.error('Error creating scholarship:', error);
        res.status(500).json({
            error: 'Failed to create scholarship',
            details: error.message,
            cloudinaryError: error
        });
    }
});

app.put('/api/scholarships/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { _id, ...updateData } = req.body; // Remove _id from update data if present

        let imageUrl = req.body.image; // Keep existing URL by default

        if (req.file) {
            // Upload new image to Cloudinary
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
            const uploadResponse = await cloudinary.uploader.upload(dataURI, {
                folder: 'scholarships',
                resource_type: 'auto'
            });
            imageUrl = uploadResponse.secure_url;
        }

        const updatedItem = {
            ...updateData,
            image: imageUrl,
            updatedAt: new Date()
        };

        // Try to update by _id (ObjectId) first, then by string id
        let query = {};
        try {
            const { ObjectId } = require('mongodb');
            query = { _id: new ObjectId(id) };
        } catch (e) {
            query = { id: id };
        }

        // Fallback for string IDs if ObjectId fails or not found
        let result = await db.collection('scholarships').updateOne(query, { $set: updatedItem });

        if (result.matchedCount === 0 && query._id) {
            // If not found by ObjectId, try finding by custom string id
            query = { id: id };
            result = await db.collection('scholarships').updateOne(query, { $set: updatedItem });
        }

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Scholarship not found' });
        }

        res.json({ message: 'Scholarship updated successfully', ...updatedItem });
    } catch (error) {
        console.error('Error updating scholarship:', error);
        res.status(500).json({
            error: 'Failed to update scholarship',
            details: error.message,
            cloudinaryError: error
        });
    }
});

app.delete('/api/scholarships/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const force = req.query.force === 'true';

        console.log(`[DELETE] Received request to delete scholarship: ${id} (force: ${force})`);

        // Check for active applications
        const applicationCount = await db.collection('applications').countDocuments({ scholarshipId: id });

        if (applicationCount > 0 && !force) {
            console.warn(`[DELETE] Blocked: Scholarship ${id} has ${applicationCount} active applications.`);
            return res.status(409).json({
                error: 'Active applications detected',
                count: applicationCount,
                message: `This scholarship has ${applicationCount} active student application(s). Deleting it will orphan these records.`
            });
        }

        // Try to delete by custom id first, then by MongoDB _id
        let result = await db.collection('scholarships').deleteOne({ id: id });
        console.log(`[DELETE] Primary ID check result: ${result.deletedCount} deleted`);

        if (result.deletedCount === 0 && ObjectId.isValid(id)) {
            console.log(`[DELETE] Attempting deletion by ObjectId for: ${id}`);
            try {
                result = await db.collection('scholarships').deleteOne({ _id: new ObjectId(id) });
                console.log(`[DELETE] ObjectId check result: ${result.deletedCount} deleted`);
            } catch (oidErr) {
                console.error(`[DELETE] Error with ObjectId conversion:`, oidErr);
            }
        }

        if (result.deletedCount > 0) {
            console.log(`[DELETE] Successfully deleted scholarship: ${id}`);
            res.json({ message: 'Scholarship deleted successfully permanently' });
        } else {
            console.warn(`[DELETE] Scholarship not found for deletion: ${id}`);
            res.status(404).json({ error: 'Scholarship not found' });
        }
    } catch (error) {
        console.error('Delete scholarship error:', error);
        res.status(500).json({ error: 'Failed to delete scholarship' });
    }
});

// Bulk Delete Scholarships
app.post('/api/scholarships/bulk-delete', async (req, res) => {
    try {
        const { ids, force } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'IDs are required' });
        }

        console.log(`[BULK DELETE] Received request for ${ids.length} scholarships (force: ${force})`);

        // Check for active applications
        const applicationCount = await db.collection('applications').countDocuments({
            scholarshipId: { $in: ids }
        });

        if (applicationCount > 0 && !force) {
            console.warn(`[BULK DELETE] Blocked: ${applicationCount} active applications found.`);
            return res.status(409).json({
                error: 'Active applications detected',
                count: applicationCount,
                message: `One or more selected scholarships have active student applications (${applicationCount} total). Deleting them will orphan these records.`
            });
        }

        // Perform Deletion
        const objectIds = ids.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));

        const deleteResult = await db.collection('scholarships').deleteMany({
            $or: [
                { id: { $in: ids } },
                { _id: { $in: objectIds } }
            ]
        });

        console.log(`[BULK DELETE] Successfully deleted ${deleteResult.deletedCount} scholarships.`);
        res.json({
            message: `Successfully deleted ${deleteResult.deletedCount} scholarships permanently.`,
            deletedCount: deleteResult.deletedCount
        });

    } catch (error) {
        console.error('Bulk delete error:', error);
        res.status(500).json({ error: 'Failed to perform bulk deletion' });
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
        const newItem = {
            ...req.body,
            id: req.body.id || `service-${Date.now()}`,
            createdAt: new Date()
        };
        const result = await db.collection('services').insertOne(newItem);
        res.status(201).json({ ...newItem, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create service' });
    }
});

app.delete('/api/services/:id', async (req, res) => {
    try {
        let result = await db.collection('services').deleteOne({ id: req.params.id });
        if (result.deletedCount === 0 && ObjectId.isValid(req.params.id)) {
            result = await db.collection('services').deleteOne({ _id: new ObjectId(req.params.id) });
        }
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
        const newItem = {
            ...req.body,
            id: req.body.id || `team-${Date.now()}`,
            createdAt: new Date()
        };
        const result = await db.collection('team').insertOne(newItem);
        res.status(201).json({ ...newItem, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create team member' });
    }
});

app.delete('/api/team/:id', async (req, res) => {
    try {
        let result = await db.collection('team').deleteOne({ id: req.params.id });
        if (result.deletedCount === 0 && ObjectId.isValid(req.params.id)) {
            result = await db.collection('team').deleteOne({ _id: new ObjectId(req.params.id) });
        }
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
        const newItem = {
            ...req.body,
            id: req.body.id || `blog-${Date.now()}`,
            createdAt: new Date()
        };
        const result = await db.collection('blog').insertOne(newItem);
        res.status(201).json({ ...newItem, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create blog post' });
    }
});

app.delete('/api/blog/:id', async (req, res) => {
    try {
        let result = await db.collection('blog').deleteOne({ id: req.params.id });
        if (result.deletedCount === 0 && ObjectId.isValid(req.params.id)) {
            result = await db.collection('blog').deleteOne({ _id: new ObjectId(req.params.id) });
        }
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
        const newItem = {
            ...req.body,
            id: req.body.id || `faq-${Date.now()}`,
            createdAt: new Date()
        };
        const result = await db.collection('faqs').insertOne(newItem);
        res.status(201).json({ ...newItem, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create FAQ' });
    }
});

app.delete('/api/faqs/:id', async (req, res) => {
    try {
        let result = await db.collection('faqs').deleteOne({ id: req.params.id });
        if (result.deletedCount === 0 && ObjectId.isValid(req.params.id)) {
            result = await db.collection('faqs').deleteOne({ _id: new ObjectId(req.params.id) });
        }
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
        const newItem = {
            ...req.body,
            id: req.body.id || `testimonial-${Date.now()}`,
            createdAt: new Date()
        };
        const result = await db.collection('testimonials').insertOne(newItem);
        res.status(201).json({ ...newItem, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create testimonial' });
    }
});

app.delete('/api/testimonials/:id', async (req, res) => {
    try {
        let result = await db.collection('testimonials').deleteOne({ id: req.params.id });
        if (result.deletedCount === 0 && ObjectId.isValid(req.params.id)) {
            result = await db.collection('testimonials').deleteOne({ _id: new ObjectId(req.params.id) });
        }
        result.deletedCount > 0
            ? res.json({ message: 'Deleted successfully' })
            : res.status(404).json({ error: 'Not found' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete testimonial' });
    }
});

// ========== NOTICES (Dashboard) ==========
app.get('/api/notices', async (req, res) => {
    try {
        // For regular users: only published, non-expired notices
        const now = new Date();

        // First get all notices and log them for debugging
        const allNotices = await db.collection('notices').find().toArray();
        console.log('All notices in DB:', JSON.stringify(allNotices, null, 2));

        // Filter: isPublished must not be false (includes true, 'true', undefined, etc.)
        const items = await db.collection('notices').find({
            isPublished: { $ne: false }
        }).sort({ isPinned: -1, createdAt: -1 }).toArray();

        console.log('Filtered notices for users:', items.length);
        res.json(items);
    } catch (error) {
        console.error('Error fetching notices:', error);
        res.status(500).json({ error: 'Failed to fetch notices' });
    }
});

app.get('/api/notices/admin', async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const items = await db.collection('notices').find().sort({ createdAt: -1 }).toArray();
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notices' });
    }
});

app.post('/api/notices', async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const newItem = {
            ...req.body,
            id: `notice-${Date.now()}`,
            isPublished: req.body.isPublished || false,
            isPinned: req.body.isPinned || false,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const result = await db.collection('notices').insertOne(newItem);
        res.status(201).json({ ...newItem, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create notice' });
    }
});

app.put('/api/notices/:id', async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const { id } = req.params;
        const { _id, ...updateData } = req.body;
        updateData.updatedAt = new Date();

        let query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id: id };
        const result = await db.collection('notices').updateOne(query, { $set: updateData });

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Notice not found' });
        }
        res.json({ message: 'Notice updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update notice' });
    }
});

app.delete('/api/notices/:id', async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const { id } = req.params;
        let result = await db.collection('notices').deleteOne({ id: id });
        if (result.deletedCount === 0 && ObjectId.isValid(id)) {
            result = await db.collection('notices').deleteOne({ _id: new ObjectId(id) });
        }
        result.deletedCount > 0
            ? res.json({ message: 'Notice deleted successfully' })
            : res.status(404).json({ error: 'Notice not found' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete notice' });
    }
});

// ========== DASHBOARD FAQs ==========
app.get('/api/dashboard-faqs', async (req, res) => {
    try {
        const items = await db.collection('dashboard_faqs').find({ isPublished: true })
            .sort({ order: 1, createdAt: -1 }).toArray();
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch FAQs' });
    }
});

app.get('/api/dashboard-faqs/admin', async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const items = await db.collection('dashboard_faqs').find().sort({ order: 1, createdAt: -1 }).toArray();
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch FAQs' });
    }
});

app.post('/api/dashboard-faqs', async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const count = await db.collection('dashboard_faqs').countDocuments();
        const newItem = {
            ...req.body,
            id: `faq-${Date.now()}`,
            order: req.body.order || count + 1,
            isPublished: req.body.isPublished !== false,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const result = await db.collection('dashboard_faqs').insertOne(newItem);
        res.status(201).json({ ...newItem, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create FAQ' });
    }
});

app.put('/api/dashboard-faqs/:id', async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const { id } = req.params;
        const { _id, ...updateData } = req.body;
        updateData.updatedAt = new Date();

        let query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id: id };
        const result = await db.collection('dashboard_faqs').updateOne(query, { $set: updateData });

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'FAQ not found' });
        }
        res.json({ message: 'FAQ updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update FAQ' });
    }
});

app.delete('/api/dashboard-faqs/:id', async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const { id } = req.params;
        let result = await db.collection('dashboard_faqs').deleteOne({ id: id });
        if (result.deletedCount === 0 && ObjectId.isValid(id)) {
            result = await db.collection('dashboard_faqs').deleteOne({ _id: new ObjectId(id) });
        }
        result.deletedCount > 0
            ? res.json({ message: 'FAQ deleted successfully' })
            : res.status(404).json({ error: 'FAQ not found' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete FAQ' });
    }
});

// ========== SURVEYS ==========
app.get('/api/surveys/active', async (req, res) => {
    try {
        // First, log all surveys for debugging
        const allSurveys = await db.collection('surveys').find().toArray();
        console.log('All surveys in DB:', JSON.stringify(allSurveys, null, 2));

        // Find any survey that is not explicitly inactive
        const survey = await db.collection('surveys').findOne({
            isActive: { $ne: false }
        });

        console.log('Found active survey:', survey ? survey.title : 'None');

        if (!survey) {
            return res.json({ survey: null, userResponse: null });
        }

        // Check if user has already responded
        let userResponse = null;
        if (req.session && req.session.user) {
            userResponse = await db.collection('survey_responses').findOne({
                surveyId: survey._id,
                userId: req.session.user._id || req.session.user.id
            });
        }

        res.json({ survey, userResponse });
    } catch (error) {
        console.error('Error fetching active survey:', error);
        res.status(500).json({ error: 'Failed to fetch active survey' });
    }
});

app.get('/api/surveys/user-status', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Please login' });
        }
        const activeSurvey = await db.collection('surveys').findOne({ isActive: true });
        if (!activeSurvey) {
            return res.json({ hasActiveSurvey: false, completed: false });
        }

        const response = await db.collection('survey_responses').findOne({
            surveyId: activeSurvey._id,
            email: req.session.user.email
        });

        res.json({
            hasActiveSurvey: true,
            surveyId: activeSurvey._id,
            completed: !!response
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to check survey status' });
    }
});

app.post('/api/surveys/submit', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Please login' });
        }
        const { surveyId, responses } = req.body;

        // Check if already submitted
        const existing = await db.collection('survey_responses').findOne({
            surveyId: new ObjectId(surveyId),
            email: req.session.user.email
        });

        if (existing) {
            return res.status(400).json({ error: 'You have already completed this survey' });
        }

        const newResponse = {
            surveyId: new ObjectId(surveyId),
            userId: req.session.user._id || req.session.user.id,
            email: req.session.user.email,
            responses: responses,
            submittedAt: new Date()
        };

        await db.collection('survey_responses').insertOne(newResponse);
        res.status(201).json({ message: 'Survey submitted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit survey' });
    }
});

app.get('/api/surveys', async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const items = await db.collection('surveys').find().sort({ createdAt: -1 }).toArray();
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch surveys' });
    }
});

app.post('/api/surveys', async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        // If setting as active, deactivate others
        if (req.body.isActive) {
            await db.collection('surveys').updateMany({}, { $set: { isActive: false } });
        }

        const newItem = {
            ...req.body,
            id: `survey-${Date.now()}`,
            createdAt: new Date()
        };
        const result = await db.collection('surveys').insertOne(newItem);
        res.status(201).json({ ...newItem, _id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create survey' });
    }
});

app.put('/api/surveys/:id', async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const { id } = req.params;
        const { _id, ...updateData } = req.body;

        // If setting as active, deactivate others
        if (updateData.isActive) {
            await db.collection('surveys').updateMany(
                { _id: { $ne: new ObjectId(id) } },
                { $set: { isActive: false } }
            );
        }

        let query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id: id };
        const result = await db.collection('surveys').updateOne(query, { $set: updateData });

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Survey not found' });
        }
        res.json({ message: 'Survey updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update survey' });
    }
});

app.delete('/api/surveys/:id', async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const { id } = req.params;
        let result = await db.collection('surveys').deleteOne({ id: id });
        if (result.deletedCount === 0 && ObjectId.isValid(id)) {
            result = await db.collection('surveys').deleteOne({ _id: new ObjectId(id) });
        }
        // Also delete responses
        await db.collection('survey_responses').deleteMany({ surveyId: new ObjectId(id) });

        result.deletedCount > 0
            ? res.json({ message: 'Survey deleted successfully' })
            : res.status(404).json({ error: 'Survey not found' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete survey' });
    }
});

// POST survey response (user submits survey)
app.post('/api/surveys/:id/responses', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Please login to submit survey' });
        }

        const { id } = req.params;
        const { responses } = req.body;

        // Check if user already submitted
        const existing = await db.collection('survey_responses').findOne({
            surveyId: new ObjectId(id),
            userId: req.session.user._id || req.session.user.id
        });

        if (existing) {
            return res.status(400).json({ error: 'You have already submitted this survey' });
        }

        // Save the response
        const result = await db.collection('survey_responses').insertOne({
            surveyId: new ObjectId(id),
            userId: req.session.user._id || req.session.user.id,
            userEmail: req.session.user.email,
            responses: responses,
            submittedAt: new Date()
        });

        res.status(201).json({ message: 'Survey submitted successfully', id: result.insertedId });
    } catch (error) {
        console.error('Error submitting survey:', error);
        res.status(500).json({ error: 'Failed to submit survey' });
    }
});

app.get('/api/surveys/:id/responses', async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const { id } = req.params;
        const responses = await db.collection('survey_responses')
            .find({ surveyId: new ObjectId(id) })
            .sort({ submittedAt: -1 })
            .toArray();
        res.json(responses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch responses' });
    }
});

// ========== CONTACT FORM EMAIL ==========
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const emailHtml = `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <hr>
            <p><em>Reply to: ${email}</em></p>
        `;

        await sendSystemEmail(
            process.env.EMAIL_USER,
            `Contact Form: ${subject}`,
            emailHtml
        );
        res.json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

// ========== APPLICATIONS ==========
app.post('/api/applications', async (req, res) => {
    try {
        // Security check: Only customers can create applications
        if (!req.session.user) {
            return res.status(401).json({ error: 'Please login to apply' });
        }

        if (req.session.user.role !== 'customer' && req.session.user.role !== 'admin') {
            return res.status(403).json({ error: 'Management users cannot create applications, please use a student account or admin account for testing.' });
        }

        // Check if user already has an application
        const existingApp = await db.collection('applications').findOne({ email: req.session.user.email });
        if (existingApp) {
            return res.status(400).json({
                error: 'You already have an application. Each user is limited to one application at a time.',
                existingAppId: existingApp.id
            });
        }

        const newItem = {
            ...req.body,
            email: req.session.user.email, // Force use of session email
            id: req.body.id || `app-${Date.now()}`,
            status: req.body.status || 'Approved',
            submittedAt: req.body.submittedAt || new Date()
        };
        const result = await db.collection('applications').insertOne(newItem);

        // Send email on submission (Approved status - no admin verification needed)
        if (newItem.status === 'Approved') {
            console.log(`[Email] New submission via POST: ${newItem.id}`);
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #0284c7; margin: 0;">Application Received</h2>
                        <p style="color: #64748b; font-size: 14px;">The Planet Scholar</p>
                    </div>
                    <p>Dear <strong>${newItem.firstName || 'Student'}</strong>,</p>
                    <p>Thanks for your application for <strong>${newItem.scholarshipName || 'Scholarship'}</strong>.</p>
                    <p>We have successfully received your submission and our team will begin the review process shortly.</p>
                    
                    <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #0ea5e9;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #0369a1;">What happens next?</p>
                        <p style="margin: 0; color: #0c4a6e; font-size: 15px;">We will continue to communicate with you regarding your application status through:</p>
                        <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #0c4a6e;">
                            <li>The <strong>Message</strong> tab on our website</li>
                            <li>Direct Email</li>
                            <li>WhatsApp / WeChat</li>
                        </ul>
                    </div>
                    
                    <p>Please log in to your dashboard regularly to check for updates and messages.</p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;">
                    <p style="font-size: 13px; color: #94a3b8; text-align: center;">
                        This is an automated confirmation of your application submission.
                        <br>
                        &copy; ${new Date().getFullYear()} The Planet Scholar. All rights reserved.
                    </p>
                </div>
            `;
            sendSystemEmail(newItem.email, "Application Received - The Planet Scholar", emailHtml);
        }

        res.status(201).json({ ...newItem, _id: result.insertedId });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ error: 'Failed to submit application' });
    }
});

app.get('/api/applications', async (req, res) => {
    try {
        const items = await db.collection('applications').find().toArray();
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

app.get('/api/applications/user', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const items = await db.collection('applications').find({ email }).toArray();
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user applications' });
    }
});

app.put('/api/applications/:id', async (req, res) => {
    try {
        const { ObjectId } = require('mongodb'); // Ensure ObjectId is available
        const { id } = req.params;
        const { _id, ...updateData } = req.body;

        // Security check: Ensure user owns this application OR is admin
        if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });

        const query = (id.length === 24 && ObjectId.isValid(id)) ? { _id: new ObjectId(id) } : { id: id };
        const existingApp = await db.collection('applications').findOne(query);

        if (!existingApp) return res.status(404).json({ error: 'Application not found' });

        if (req.session.user.role !== 'admin' && existingApp.email !== req.session.user.email) {
            return res.status(403).json({ error: 'You do not have permission to edit this application' });
        }

        // If submitting (status changing to Approved), reset canReapply
        const finalUpdateData = { ...updateData, updatedAt: new Date() };
        if (updateData.status === 'Approved') {
            finalUpdateData.canReapply = false;
        }

        const result = await db.collection('applications').updateOne(
            query,
            { $set: finalUpdateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // Check if status changed to 'Approved' (Direct approval on submission)
        if (updateData.status === 'Approved') {
            const recipientEmail = existingApp.email || req.session.user.email;
            console.log(`[Email] Detected submission for application: ${existingApp._id || existingApp.id} (Status: ${updateData.status})`);
            console.log(`[Email] Attempting to send confirmation to: ${recipientEmail}`);

            const emailHtml = `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #0284c7; margin: 0;">Application Received</h2>
                        <p style="color: #64748b; font-size: 14px;">The Planet Scholar</p>
                    </div>
                    <p>Dear <strong>${existingApp.firstName || 'Student'}</strong>,</p>
                    <p>Thanks for your application for <strong>${existingApp.scholarshipName || 'Scholarship'}</strong>.</p>
                    <p>We have successfully received your submission and our team will begin the review process shortly.</p>
                    
                    <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #0ea5e9;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #0369a1;">What happens next?</p>
                        <p style="margin: 0; color: #0c4a6e; font-size: 15px;">We will continue to communicate with you regarding your application status through:</p>
                        <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #0c4a6e;">
                            <li>The <strong>Message</strong> tab on our website</li>
                            <li>Direct Email</li>
                            <li>WhatsApp / WeChat</li>
                        </ul>
                    </div>
                    
                    <p>Please log in to your dashboard regularly to check for updates and messages.</p>
                    
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;">
                    
                    <p style="font-size: 13px; color: #94a3b8; text-align: center;">
                        This is an automated confirmation of your application submission.
                        <br>
                        &copy; ${new Date().getFullYear()} The Planet Scholar. All rights reserved.
                    </p>
                </div>
            `;

            sendSystemEmail(
                recipientEmail,
                "Application Received - The Planet Scholar",
                emailHtml
            );
        }

        res.json({ message: 'Application updated successfully' });
    } catch (error) {
        console.error('Error updating application:', error);
        res.status(500).json({ error: 'Failed to update application' });
    }
});

// Toggle Re-Apply Permission (Admin only)
app.post('/api/applications/:id/toggle-reapply', async (req, res) => {
    try {
        console.log(`[TOGGLE RE-APPLY] Request for AppID: ${req.params.id}. Session: ${req.session.id}. User Role: ${req.session.user?.role}`);
        if (!req.session.user || req.session.user.role !== 'admin') {
            console.log(`[TOGGLE RE-APPLY] ACCESS DENIED. Role: ${req.session.user?.role}`);
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { id } = req.params;
        const query = (id.length === 24 && ObjectId.isValid(id)) ? { _id: new ObjectId(id) } : { id: id };

        const application = await db.collection('applications').findOne(query);
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        const newValue = !application.canReapply;
        await db.collection('applications').updateOne(query, { $set: { canReapply: newValue, updatedAt: new Date() } });

        res.json({ message: `Re-apply permission ${newValue ? 'granted' : 'revoked'}`, canReapply: newValue });
    } catch (error) {
        console.error('Error toggling reapply:', error);
        res.status(500).json({ error: 'Failed to toggle reapply permission' });
    }
});

app.delete('/api/applications/:id', async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        const { id } = req.params;

        // Try to delete by custom id first
        let result = await db.collection('applications').deleteOne({ id: id });

        if (result.deletedCount === 0) {
            // Try by ObjectId
            try {
                result = await db.collection('applications').deleteOne({ _id: new ObjectId(id) });
            } catch (e) {
                // Ignore ObjectId error
            }
        }

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        res.json({ message: 'Application deleted successfully' });
    } catch (error) {
        console.error('Error deleting application:', error);
        res.status(500).json({ error: 'Failed to delete application' });
    }
});

// Download application files as ZIP
app.get('/api/applications/:id/download-files', async (req, res) => {
    try {
        console.log(`[DOWNLOAD FILES] ID: ${req.params.id}. Session: ${req.session.id}. Role: ${req.session.user?.role}`);
        if (!req.session.user || req.session.user.role !== 'admin') {
            console.log(`[DOWNLOAD FILES] ACCESS DENIED. Role: ${req.session.user?.role}`);
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        const { id } = req.params;

        // Find application by ID
        let application;
        try {
            application = await db.collection('applications').findOne({ _id: new ObjectId(id) });
        } catch (e) {
            application = await db.collection('applications').findOne({ id: id });
        }

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // Collect all document URLs from the application
        const documents = application.documents || {};
        const moreInfo = application.moreInfo || {};

        const fileUrls = [];

        // Add documents from documents object
        Object.entries(documents).forEach(([key, value]) => {
            if (value && typeof value === 'string' && value.startsWith('http')) {
                fileUrls.push({ name: key, url: value });
            }
        });

        // Add video if exists
        if (moreInfo.video && typeof moreInfo.video === 'string' && moreInfo.video.startsWith('http')) {
            fileUrls.push({ name: 'applicantVideo', url: moreInfo.video });
        }

        // Add photo if exists
        if (application.photo && typeof application.photo === 'string' && application.photo.startsWith('http')) {
            fileUrls.push({ name: 'photo', url: application.photo });
        }

        if (fileUrls.length === 0) {
            return res.status(400).json({ error: 'No files available for download' });
        }

        // Create ZIP filename from applicant name
        const firstName = application.firstName || application.passportFamilyName || 'Unknown';
        const lastName = application.lastName || application.givenName || 'Applicant';
        const zipFileName = `${firstName}_${lastName}_documents.zip`.replace(/\s+/g, '_');

        // Create archiver instance (Optimization: level 0/store as files are already compressed)
        const archive = archiver('zip', { store: true });
        const startTime = Date.now();

        archive.on('warning', (err) => {
            if (err.code === 'ENOENT') {
                console.warn('Archiver warning:', err);
            } else {
                throw err;
            }
        });

        archive.on('error', (err) => {
            console.error('Archive error:', err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to create archive' });
            }
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);

        // Pipe archive to response
        archive.pipe(res);

        // Download each file and add to archive
        const downloadPromises = fileUrls.map((file) => {
            return new Promise((resolve) => {
                const url = file.url;
                const protocol = url.startsWith('https') ? https : http;

                // Get file extension from URL
                const urlPath = new URL(url).pathname;
                const ext = urlPath.includes('.') ? urlPath.substring(urlPath.lastIndexOf('.')) : '.bin';
                const fileName = `${file.name}${ext}`;

                protocol.get(url, (response) => {
                    if (response.statusCode === 200) {
                        archive.append(response, { name: fileName });
                        response.on('end', resolve);
                        response.on('error', (err) => {
                            console.warn(`[ZIP] Error reading stream for ${file.name}:`, err.message);
                            resolve();
                        });
                    } else {
                        console.warn(`[ZIP] Failed to download ${file.name}: HTTP ${response.statusCode}`);
                        resolve();
                    }
                }).on('error', (err) => {
                    console.warn(`[ZIP] Network error for ${file.name}:`, err.message);
                    resolve();
                });
            });
        });

        await Promise.all(downloadPromises);
        await archive.finalize();
        console.log(`[ZIP] Archive for ${zipFileName} completed in ${Date.now() - startTime}ms`);

    } catch (error) {
        console.error('Error downloading application files:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to download files' });
        }
    }
});

// ========== AUTHENTICATION ==========

// Send Verification Code
app.post('/api/auth/send-verification', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const normalizedEmail = email.toLowerCase().trim();

        // Check if email already exists
        const existingUser = await db.collection('users').findOne({ email: normalizedEmail });
        if (existingUser) return res.status(400).json({ error: 'Email already registered' });

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store in DB (upsert)
        await db.collection('verification_codes').updateOne(
            { email: normalizedEmail },
            { $set: { code, expiresAt, createdAt: new Date() } },
            { upsert: true }
        );

        console.log(`[DEBUG] Generated Verification Code for ${normalizedEmail}: ${code}`);

        // Send Email
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Email Verification</h2>
                <p>Your verification code is:</p>
                <h1 style="color: #0ea5e9; letter-spacing: 5px;">${code}</h1>
                <p>This code will expire in 10 minutes.</p>
            </div>
        `;

        await sendSystemEmail(email, 'Your Verification Code - The Planet Scholar', emailHtml);
        res.json({ message: 'Verification code sent' });

    } catch (error) {
        console.error('Send verification error:', error);
        res.status(500).json({
            error: 'Failed to send verification code',
            details: error.message,
            technical: 'Check Brevo API key and Sender verification'
        });
    }
});

// Verify Code
app.post('/api/auth/verify-code', async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) return res.status(400).json({ error: 'Email and code are required' });

        const normalizedEmail = email.toLowerCase().trim();
        const record = await db.collection('verification_codes').findOne({ email: normalizedEmail });

        console.log(`Verifying: ${normalizedEmail}, Code Input: ${code}, Record Found: ${!!record}, Record Code: ${record?.code}`);

        if (!record) return res.status(400).json({ error: 'Verification code not found or expired' });
        if (new Date() > record.expiresAt) return res.status(400).json({ error: 'Verification code expired' });

        // Loose comparison (string/number safe)
        if (String(record.code).trim() !== String(code).trim()) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        // Valid
        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Verify code error:', error);
        res.status(500).json({ error: 'Failed to verify code' });
    }
});

// Forgot Password
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const normalizedEmail = email.toLowerCase().trim();
        const user = await db.collection('users').findOne({ email: normalizedEmail });

        // Security: Don't reveal if user exists, but here we kind of have to because 
        // we're sending an email. Standard is "If email exists, you will receive code"
        if (!user) {
            return res.json({ message: 'If an account exists with that email, you will receive a reset code.' });
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Store in verification_codes collection (sharing same collection for simplicity)
        await db.collection('verification_codes').updateOne(
            { email: normalizedEmail, type: 'password_reset' },
            { $set: { code, expiresAt, createdAt: new Date() } },
            { upsert: true }
        );

        const emailHtml = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1e293b; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px;">
                <h2 style="color: #0ea5e9; font-size: 24px; margin-bottom: 20px;">Password Reset Request</h2>
                <p style="font-size: 16px; line-height: 1.6;">You requested to reset your password for <strong>The Planet Scholar</strong>.</p>
                <p style="font-size: 16px; line-height: 1.6;">Please use the following 6-digit code to complete the process:</p>
                <div style="background: #f8fafc; padding: 20px; border-radius: 12px; text-align: center; margin: 25px 0;">
                    <h1 style="color: #0ea5e9; letter-spacing: 8px; font-size: 32px; margin: 0;">${code}</h1>
                </div>
                <p style="font-size: 14px; color: #64748b;">This code will expire in 60 minutes. If you did not request this, please ignore this email.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                <p style="font-size: 12px; color: #94a3b8; text-align: center;">&copy; ${new Date().getFullYear()} The Planet Scholar. All rights reserved.</p>
            </div>
        `;

        await sendSystemEmail(normalizedEmail, 'Password Reset Code - The Planet Scholar', emailHtml);
        res.json({ message: 'If an account exists with that email, you will receive a reset code.' });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

// Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        if (!email || !code || !newPassword) {
            return res.status(400).json({ error: 'Email, code, and new password are required' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const record = await db.collection('verification_codes').findOne({
            email: normalizedEmail,
            code: code.toString().trim(),
            type: 'password_reset'
        });

        if (!record) return res.status(400).json({ error: 'Invalid or expired reset code' });
        if (new Date() > record.expiresAt) return res.status(400).json({ error: 'Reset code expired' });

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user
        const result = await db.collection('users').updateOne(
            { email: normalizedEmail },
            { $set: { password: hashedPassword, updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Clear reset record
        await db.collection('verification_codes').deleteOne({ _id: record._id });

        res.json({ message: 'Password reset successfully. You can now log in.' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});
app.post('/api/auth/register', async (req, res) => {
    try {
        const {
            email,
            password,
            surname,
            givenName,
            hasPassport,
            passportNumber,
            nationality
        } = req.body;

        // Basic validation
        if (!email || !password || !surname || !givenName) {
            return res.status(400).json({ error: 'All required fields must be filled' });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await db.collection('users').findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Construct detailed user object
        const newUser = {
            name: `${surname} ${givenName}`, // Combined for backward compatibility
            surname,
            givenName,
            email: normalizedEmail,
            password: hashedPassword,
            hasPassport: !!hasPassport,
            passportNumber: hasPassport ? passportNumber : null,
            nationality,
            role: 'customer',
            profileComplete: true, // Assuming initial registration fills enough? Or keep false if more needed. Let's say true for these basics.
            createdAt: new Date()
        };

        const result = await db.collection('users').insertOne(newUser);

        // Return session user without password
        const userResponse = {
            _id: result.insertedId,
            name: newUser.name,
            email,
            role: 'customer',
            profileComplete: newUser.profileComplete
        };

        req.session.user = userResponse;
        res.status(201).json(userResponse);
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role || 'customer'
        };

        req.session.user = userResponse;
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ error: 'Failed to establish session' });
            }
            console.log(`[AUTH] Session saved for user: ${user.email}. Role: ${userResponse.role}`);
            res.json(userResponse);
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: 'Failed to logout' });
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
    });
});

app.get('/api/auth/me', (req, res) => {
    if (req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

// Update user profile
app.put('/api/auth/profile', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { firstName, lastName, phone, university, country } = req.body;
        const userId = req.session.user._id;

        const updateData = {
            firstName,
            lastName,
            phone,
            university,
            country,
            profileComplete: true,
            updatedAt: new Date()
        };

        // Update user in database
        await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $set: updateData }
        );

        // Update session with new data
        const updatedUser = {
            ...req.session.user,
            ...updateData
        };
        req.session.user = updatedUser;

        res.json(updatedUser);
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// --- User Management API (Admin only) ---

// Get all users with application counts
app.get('/api/users', async (req, res) => {
    try {
        console.log(`[GET /api/users] Request received. Session: ${req.session.id}. User object exists: ${!!req.session.user}. Role: ${req.session.user?.role}`);
        if (!req.session.user || req.session.user.role !== 'admin') {
            console.log(`[GET /api/users] ACCESS DENIED. Session ID: ${req.session.id}. Role: ${req.session.user?.role}`);
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        const users = await db.collection('users').aggregate([
            {
                $lookup: {
                    from: 'applications',
                    localField: 'email',
                    foreignField: 'email',
                    as: 'userApplications'
                }
            },
            {
                $addFields: {
                    appCount: { $size: '$userApplications' }
                }
            },
            {
                $project: {
                    password: 0,
                    userApplications: 0
                }
            },
            { $sort: { createdAt: -1 } }
        ]).toArray();

        console.log(`[GET /api/users] Aggregation complete. Found ${users.length} users.`);
        res.json(users);
    } catch (error) {
        console.error('Fetch users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Admin create user
app.post('/api/users', async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        const { name, email, password, role } = req.body;

        const existingUser = await db.collection('users').findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: role || 'customer',
            createdAt: new Date()
        };

        const result = await db.collection('users').insertOne(newUser);
        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json({ ...userWithoutPassword, _id: result.insertedId });
    } catch (error) {
        console.error('Admin create user error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Admin update user
app.put('/api/users/:id', async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        const { name, email, role, password } = req.body;
        const userId = req.params.id;

        const updateData = {
            name,
            email: email.toLowerCase(),
            role,
            updatedAt: new Date()
        };

        if (password && password.trim() !== '') {
            updateData.password = await bcrypt.hash(password, 10);
        }

        await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $set: updateData }
        );

        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Admin update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Admin delete user
app.delete('/api/users/:id', async (req, res) => {
    try {
        console.log(`[DELETE USER] ID: ${req.params.id}. Session: ${req.session.id}. Role: ${req.session.user?.role}`);
        if (!req.session.user || req.session.user.role !== 'admin') {
            console.log(`[DELETE USER] ACCESS DENIED. Role: ${req.session.user?.role}`);
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        const userId = req.params.id;
        const userToDelete = await db.collection('users').findOne({ _id: new ObjectId(userId) });

        if (!userToDelete) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete user applications too
        await db.collection('applications').deleteMany({ email: userToDelete.email });

        // Delete user
        await db.collection('users').deleteOne({ _id: new ObjectId(userId) });

        res.json({ message: 'User and their applications deleted successfully' });
    } catch (error) {
        console.error('Admin delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Get specific user's applications
app.get('/api/users/:id/applications', async (req, res) => {
    try {
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        const user = await db.collection('users').findOne({ _id: new ObjectId(req.params.id) });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const userApplications = await db.collection('applications').find({ email: user.email }).toArray();
        res.json(userApplications);
    } catch (error) {
        console.error('Fetch user applications error:', error);
        res.status(500).json({ error: 'Failed to fetch user applications' });
    }
});

// --- Messaging System Endpoints ---

// Get message history with another user
app.get('/api/messages/:otherUserId', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const messagesCollection = db.collection('messages');
        const myId = (req.session.user._id || req.session.user.id).toString();
        const otherId = req.params.otherUserId;

        // Mark incoming messages as read
        await messagesCollection.updateMany(
            { senderId: otherId, receiverId: myId, isRead: false },
            { $set: { isRead: true } }
        );

        const messages = await messagesCollection.find({
            $or: [
                { senderId: myId, receiverId: otherId },
                { senderId: otherId, receiverId: myId }
            ]
        }).sort({ timestamp: 1 }).toArray();

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Get total unread count for current user
app.get('/api/messages/unread-count', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const messagesCollection = db.collection('messages');
        const myId = (req.session.user._id || req.session.user.id).toString();
        const count = await messagesCollection.countDocuments({ receiverId: myId, isRead: false });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete chat history with another user
app.delete('/api/messages/:otherUserId', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const messagesCollection = db.collection('messages');
        const myId = (req.session.user._id || req.session.user.id).toString();
        const otherId = req.params.otherUserId;

        await messagesCollection.deleteMany({
            $or: [
                { senderId: myId, receiverId: otherId },
                { senderId: otherId, receiverId: myId }
            ]
        });

        res.json({ message: 'Chat history deleted successfully' });
    } catch (error) {
        console.error('Error deleting messages:', error);
        res.status(500).json({ error: 'Failed to delete messages' });
    }
});

// Send a message
app.post('/api/messages', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });

    const { receiverId, content } = req.body;
    if (!receiverId || !content) {
        return res.status(400).json({ error: 'Receiver ID and content are required' });
    }

    try {
        const myId = (req.session.user._id || req.session.user.id).toString();
        const otherId = receiverId.toString();

        if (myId === otherId) {
            return res.status(400).json({ error: 'Cannot send message to yourself' });
        }

        const messagesCollection = db.collection('messages');
        const newMessage = {
            senderId: myId,
            receiverId: otherId,
            content,
            timestamp: new Date(),
            isRead: false
        };

        const result = await messagesCollection.insertOne(newMessage);
        res.json({ ...newMessage, _id: result.insertedId });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Get admin conversation list (users who have messages)
app.get('/api/admin/conversations', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        const messagesCollection = db.collection('messages');
        const usersCollection = db.collection('users');
        const adminId = (req.session.user._id || req.session.user.id).toString();

        // Find all unique users who messaged admin or admin messaged them
        const results = await messagesCollection.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: adminId },
                        { receiverId: adminId }
                    ]
                }
            },
            {
                $project: {
                    userId: {
                        $cond: [
                            { $eq: ["$senderId", adminId] },
                            "$receiverId",
                            "$senderId"
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: "$userId"
                }
            },
            {
                $match: {
                    _id: { $ne: adminId }
                }
            }
        ]).toArray();

        const userIds = results.map(r => r._id);
        const mongoUserIds = userIds.map(id => {
            try { return new ObjectId(id); } catch (e) { return null; }
        }).filter(id => id !== null);

        // Fetch user details for these IDs
        const users = await usersCollection.find({
            $or: [
                { _id: { $in: mongoUserIds } },
                { id: { $in: userIds } } // Fallback for string IDs if any
            ]
        }).project({ password: 0 }).toArray();

        // Add unread count for each user
        const conversations = await Promise.all(users.map(async (u) => {
            const uid = (u._id || u.id).toString();
            const unreadCount = await messagesCollection.countDocuments({
                senderId: uid,
                receiverId: adminId,
                isRead: false
            });
            return { ...u, unreadCount };
        }));

        res.json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

// Get system admin account (to help users find who to message)
app.get('/api/admin/account', async (req, res) => {
    try {
        const usersCollection = db.collection('users');
        const admin = await usersCollection.findOne({ role: 'admin' }, { projection: { password: 0 } });
        if (!admin) return res.status(404).json({ error: 'Admin not found' });
        res.json(admin);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
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
    if (client) await client.close();
    console.log('MongoDB connection closed');
    process.exit(0);
});

// Prevent crash on unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific logging, throwing an error, or other logic here
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // Optional: exit if the error is critical
    // process.exit(1);
});
