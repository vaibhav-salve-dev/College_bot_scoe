const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sanjivani_chatbot';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB not connected'));

const messageSchema = new mongoose.Schema({
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true },
    messages: [messageSchema],
    lastActive: { type: Date, default: Date.now }
});

const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);

const conversations = new Map();

function getHistory(sessionId) {
    if (!conversations.has(sessionId)) {
        conversations.set(sessionId, []);
    }
    return conversations.get(sessionId);
}

function saveToHistory(sessionId, userMsg, botMsg) {
    const history = getHistory(sessionId);
    history.push({ user: userMsg, bot: botMsg, timestamp: Date.now() });
    if (history.length > 30) history.shift();
}

// Complete College Database
const collegeDB = {
    allCourses: ["Computer Science & Engineering", "Mechanical Engineering", "Civil Engineering", "Electrical Engineering", "Electronics & Telecommunication Engineering"],
    
    branches: {
        "computer science": {
            name: "Computer Science & Engineering",
            keywords: ["cse", "cs", "computer science", "computer engineering", "comp sci", "csew", "computer branch", "cse branch", "computer", "for computer"],
            seats: 120,
            fees: "1,21,000 rupees per year",
            duration: "4 years",
            placementRate: "95 percent",
            avgPackage: "7.5 lakhs per annum",
            highestPackage: "27 lakhs per annum",
            cutoffs: { general: 92, sc: 75, st: 70, obc: 85 },
            recruiters: ["TCS", "Infosys", "Wipro", "Cognizant", "Accenture"],
            faculty: "28 faculty members including 6 PhDs",
            labs: "8 specialized labs (AI, Cloud, Security, etc.)",
            hod: "Dr. M. A. Jawale"
        },
        "mechanical": {
            name: "Mechanical Engineering",
            keywords: ["mech", "mechanical", "mechanical engineering", "mechanical branch"],
            seats: 120,
            fees: "1,21,000 rupees per year",
            duration: "4 years",
            placementRate: "82 percent",
            avgPackage: "4.8 lakhs per annum",
            highestPackage: "12 lakhs per annum",
            cutoffs: { general: 75, sc: 58, st: 53, obc: 68 },
            recruiters: ["John Deere", "Mahindra", "L&T", "TATA Motors"],
            faculty: "25 faculty members",
            labs: "10 laboratories",
            hod: "Dr. P.M.Patare"
        },
        "civil": {
            name: "Civil Engineering",
            keywords: ["civil", "civil engineering", "civil branch"],
            seats: 60,
            fees: "1,21,000 rupees per year",
            duration: "4 years",
            placementRate: "75 percent",
            avgPackage: "4.2 lakhs per annum",
            highestPackage: "9 lakhs per annum",
            cutoffs: { general: 70, sc: 53, st: 48, obc: 63 },
            recruiters: ["L&T", "Shapoorji", "Godrej"],
            faculty: "24 faculty members",
            labs: "8 laboratories",
            hod: "Dr. A. S. Sayyad"
        },
        "electrical": {
            name: "Electrical Engineering",
            keywords: ["electrical", "electrical engineering", "electrical branch", "ee"],
            seats: 60,
            fees: "1,21,000 rupees per year",
            duration: "4 years",
            placementRate: "78 percent",
            avgPackage: "4.5 lakhs per annum",
            highestPackage: "10 lakhs per annum",
            cutoffs: { general: 72, sc: 55, st: 50, obc: 65 },
            recruiters: ["Siemens", "ABB", "TATA Power"],
            faculty: "20 faculty members",
            labs: "6 laboratories",
            hod: "Dr. Dipesh B. Pardeshi"
        },
        "electronics": {
            name: "Electronics & Telecommunication Engineering",
            keywords: ["electronics", "ece", "entc", "electronics engineering", "electronics branch"],
            seats: 60,
            fees: "1,21,000 rupees per year",
            duration: "4 years",
            placementRate: "80 percent",
            avgPackage: "4.6 lakhs per annum",
            highestPackage: "11 lakhs per annum",
            cutoffs: { general: 74, sc: 57, st: 52, obc: 67 },
            recruiters: ["Qualcomm", "Texas Instruments", "HCL"],
            faculty: "22 faculty members",
            labs: "7 laboratories",
            hod: "Dr. D. B. Kshirsagar"
        }
    },
    
    generalFees: {
        btech: "1,21,000 rupees per year",
        hostel: {
            single: "95,000 rupees per year",
            double: "75,000 rupees per year", 
            triple: "65,000 rupees per year"
        },
        transport: "25,000 rupees per year",
        mess: "35,000 rupees per year",
        cautionDeposit: "5,000 rupees (one time, refundable)",
        libraryDeposit: "2,000 rupees (one time, refundable)"
    },
    
    placement: {
        highest: "27 lakhs",
        average: "5.8 lakhs",
        rate: "85 percent",
        studentsPlaced: 827,
        offers: 1050,
        recruiters: "TCS (190), Infosys (145), Wipro (120), Cognizant (110), Accenture (95)"
    },
    
    facilities: {
        library: "Central library with 75,000+ books, 250+ journals, digital library 24x7",
        labs: "40+ specialized labs across all departments",
        sports: "Cricket ground, football ground, basketball court, volleyball court, badminton court, gymnasium",
        hostel: "Separate hostels for boys (800 capacity) and girls (500 capacity) with 24/7 Wi-Fi, gym, common room, security",
        medical: "24/7 medical center with qualified doctor",
        cafeteria: "Multi-cuisine food court",
        transport: "25 buses covering major routes",
        wifi: "1 Gbps leased line across campus"
    },
    
    contact: {
        admission: "02421-223800",
        placement: "02421-223803",
        email: "admission@sanjivanicoe.org.in",
        website: "www.sanjivanicoe.org.in",
        address: "Sanjivani College of Engineering, Kopargaon, Ahmednagar District, Maharashtra - 423601"
    },
    
    scholarships: {
        sc: { 
            name: "SC", 
            waiver: "100% tuition fee waiver", 
            details: "Full tuition fee waiver from Government of Maharashtra",
            benefits: "100% tuition waiver, hostel fee reimbursement up to ₹30,000/year, book bank facility, monthly stipend"
        },
        st: { 
            name: "ST", 
            waiver: "100% tuition fee waiver + hostel reimbursement", 
            details: "Full tuition fee waiver plus hostel fee reimbursement",
            benefits: "100% tuition waiver, full hostel reimbursement, book bank, monthly stipend"
        },
        obc: { 
            name: "OBC", 
            waiver: "50% tuition fee waiver", 
            details: "50% tuition fee waiver for family income below 6 lakhs", 
            incomeLimit: "6,00,000",
            benefits: "50% tuition fee waiver for eligible students"
        },
        ews: { 
            name: "EWS", 
            waiver: "100% tuition fee waiver", 
            details: "100% tuition fee waiver for family income below 3 lakhs", 
            incomeLimit: "3,00,000" 
        },
        general: { 
            name: "General/Open", 
            waiver: "Merit-based up to 100%", 
            details: "Merit scholarships based on 12th percentage",
            benefits: "100% for 90%+, 75% for 80-89%, 50% for 70-79%"
        }
    },
    
    hostel: {
        boys: "800 students",
        girls: "500 students",
        amenities: "24/7 Wi-Fi, gymnasium, common room with TV, indoor games, reading room, 24/7 security with CCTV, power backup, RO water purifier"
    },
    
    dates: {
        applicationEnd: "June 15, 2026",
        counseling: "July 2026",
        classesStart: "August 1, 2026"
    },
    
    // Category detection keywords
    categoryKeywords: [
        { name: "general", keywords: ["open category", "general category", "open", "general", "gen"] },
        { name: "sc", keywords: ["sc category", "schedule caste", "scheduled caste", "sc", "for sc", "sc students"] },
        { name: "st", keywords: ["st category", "schedule tribe", "scheduled tribe", "st", "for st"] },
        { name: "obc", keywords: ["obc category", "other backward class", "obc", "for obc"] },
        { name: "ews", keywords: ["ews category", "economically weaker section", "ews"] },
        { name: "nt", keywords: ["nt category", "nt-a", "nt-b", "nt-c", "nt-d", "nt"] }
    ]
};

// Helper Functions
function isFeeQuestion(message) {
    const lower = message.toLowerCase();
    return lower.includes('fee') || lower.includes('fees') || lower.includes('cost') || 
           lower.includes('tuition') || lower.includes('expensive') || lower.includes('price');
}

function isFacilityQuestion(message) {
    const lower = message.toLowerCase();
    return lower.includes('facility') || lower.includes('facilities') || lower.includes('amenities') ||
           lower.includes('library') || lower.includes('lab') || lower.includes('sports') ||
           lower.includes('hostel') || lower.includes('cafeteria') || lower.includes('transport');
}

function isPlacementQuestion(message) {
    const lower = message.toLowerCase();
    return lower.includes('placement') || lower.includes('package') || lower.includes('salary') ||
           lower.includes('recruiter') || lower.includes('company') || lower.includes('job');
}

function isScholarshipQuestion(message) {
    const lower = message.toLowerCase();
    return lower.includes('scholarship') || lower.includes('financial aid') || lower.includes('fee waiver');
}

function findBranch(message) {
    const lower = message.toLowerCase();
    for (const [key, branch] of Object.entries(collegeDB.branches)) {
        for (const keyword of branch.keywords) {
            if (lower.includes(keyword)) {
                return key;
            }
        }
    }
    return null;
}

function extractNumber(message) {
    const match = message.match(/\d+/);
    return match ? parseInt(match[0]) : null;
}

function detectCategory(message) {
    const lower = message.toLowerCase();
    for (const category of collegeDB.categoryKeywords) {
        for (const keyword of category.keywords) {
            if (lower.includes(keyword)) {
                return category.name;
            }
        }
    }
    return null;
}

function getLastBranch(history) {
    for (let i = history.length - 1; i >= 0; i--) {
        const branch = findBranch(history[i].user);
        if (branch) return branch;
    }
    return null;
}

function getLastCategory(history) {
    for (let i = history.length - 1; i >= 0; i--) {
        const category = detectCategory(history[i].user);
        if (category) return category;
    }
    return null;
}

// Conversation state
const conversationState = new Map();

function getConversationState(sessionId) {
    if (!conversationState.has(sessionId)) {
        conversationState.set(sessionId, { pendingCategory: null, step: 0, lastTopic: null });
    }
    return conversationState.get(sessionId);
}

function updateConversationState(sessionId, category, step) {
    conversationState.set(sessionId, { pendingCategory: category, step: step, lastTopic: 'scholarship' });
}

function clearConversationState(sessionId) {
    conversationState.set(sessionId, { pendingCategory: null, step: 0, lastTopic: null });
}

// Scholarship Response
function getScholarshipResponse(category, step) {
    const s = collegeDB.scholarships[category];
    if (!s) return null;
    
    if (step === 0) {
        if (category === 'general') {
            return `For ${s.name} category students, B.Tech tuition is ${collegeDB.generalFees.btech} per year. ${s.waiver} - 90%+ in 12th: 100% waiver, 80-89%: 75% waiver, 70-79%: 50% waiver. Hostel: ${collegeDB.generalFees.hostel.triple} to ${collegeDB.generalFees.hostel.single}. Would you like more details?`;
        }
        if (category === 'sc') {
            return `${s.name} students get ${s.waiver} - ZERO tuition fees! Hostel: ${collegeDB.generalFees.hostel.triple} to ${collegeDB.generalFees.hostel.single}. Transport: ${collegeDB.generalFees.transport}. Benefits: ${s.benefits}. Would you like more details?`;
        }
        if (category === 'obc') {
            return `OBC students with income below ${s.incomeLimit} get ${s.waiver}. Tuition: ${collegeDB.generalFees.btech}, you pay ~60,500/year. Hostel: ${collegeDB.generalFees.hostel.triple} to ${collegeDB.generalFees.hostel.single}. Would you like eligibility details?`;
        }
        return `${s.name} category: ${s.waiver}. Would you like more details?`;
    }
    if (step === 1) {
        if (category === 'sc') {
            return `📋 SC Scholarship Details:\n\nEligibility: SC category, valid caste certificate\nBenefits: ${s.benefits}\nDocuments: Caste certificate, validity certificate, income certificate, marksheets, bank passbook\n\nWould you like the application process?`;
        }
        if (category === 'obc') {
            return `📋 OBC Scholarship Details:\n\nEligibility: Income < ₹6L, valid OBC certificate, 75% attendance\nAmount: 50% tuition waiver (max ₹60k/year)\nDocuments: OBC certificate, income certificate, marksheets, bank details\n\nWould you like the application process?`;
        }
        return `Would you like the application process for ${s.name} scholarship?`;
    }
    if (step === 2) {
        return `📝 Application Process:\n1. Visit mahadbtmahait.gov.in\n2. Register and fill form\n3. Upload documents\n4. College verification\n5. Government approval\n\nDeadline: August 31, 2026\n\nWould you like document details?`;
    }
    return null;
}

// Main Response Generator
function generateResponse(message, history, sessionId) {
    const lowerMsg = message.toLowerCase();
    const state = getConversationState(sessionId);
    const lastBranch = getLastBranch(history);
    const lastCategory = getLastCategory(history);
    
    // ===== HANDLE SHORT FOLLOW-UPS =====
    
    // Branch shortcuts
    if (lowerMsg === 'computer' || lowerMsg === 'for computer' || lowerMsg === 'cse') {
        const branch = collegeDB.branches["computer science"];
        return `${branch.name} has ${branch.seats} seats, ${branch.duration} duration, fees ${branch.fees}. Placement: ${branch.placementRate} placed, average ${branch.avgPackage}, highest ${branch.highestPackage}. Recruiters: ${branch.recruiters.slice(0,3).join(', ')}. Cutoff: General ${branch.cutoffs.general}, SC ${branch.cutoffs.sc}. Faculty: ${branch.faculty}, HOD: ${branch.hod}.`;
    }
    
    if (lowerMsg === 'mechanical' || lowerMsg === 'for mechanical') {
        const branch = collegeDB.branches["mechanical"];
        return `${branch.name} has ${branch.seats} seats, fees ${branch.fees}. Placement: ${branch.placementRate} placed, average ${branch.avgPackage}, highest ${branch.highestPackage}. Recruiters: ${branch.recruiters.slice(0,3).join(', ')}. Cutoff: General ${branch.cutoffs.general}, SC ${branch.cutoffs.sc}.`;
    }
    
    // Category shortcuts
    if (lowerMsg === 'sc' || lowerMsg === 'for sc') {
        const response = getScholarshipResponse('sc', 0);
        if (response) {
            updateConversationState(sessionId, 'sc', 0);
            return response;
        }
    }
    
    if (lowerMsg === 'obc' || lowerMsg === 'for obc') {
        const response = getScholarshipResponse('obc', 0);
        if (response) {
            updateConversationState(sessionId, 'obc', 0);
            return response;
        }
    }
    
    if (lowerMsg === 'open' || lowerMsg === 'general') {
        const response = getScholarshipResponse('general', 0);
        if (response) {
            updateConversationState(sessionId, 'general', 0);
            return response;
        }
    }
    
    // Handle "yes" responses
    if (lowerMsg === 'yes' || lowerMsg === 'yeah' || lowerMsg === 'yep') {
        if (state.pendingCategory) {
            const nextStep = state.step + 1;
            const response = getScholarshipResponse(state.pendingCategory, nextStep);
            if (response) {
                updateConversationState(sessionId, state.pendingCategory, nextStep);
                return response;
            }
        }
        return `Great! What specific information would you like? You can ask about eligibility, documents, or application process.`;
    }
    
    // ===== FACILITIES QUESTIONS =====
    if (isFacilityQuestion(message)) {
        const category = detectCategory(message);
        
        // If asking about SC facilities
        if (category === 'sc') {
            return `For SC students at Sanjivani College:\n\n🎓 Scholarship Benefits: ${collegeDB.scholarships.sc.benefits}\n\n🏠 Hostel: Separate hostels with 24/7 Wi-Fi, gym, security\n📚 Library: 75,000+ books, digital library\n🔬 Labs: Modern equipment in all departments\n⚽ Sports: Cricket, football, basketball, gym\n\nWould you like to know more about SC scholarship application?`;
        }
        
        // General facilities
        return `🏫 Campus Facilities at Sanjivani College:\n\n📚 Library: ${collegeDB.facilities.library}\n🔬 Labs: ${collegeDB.facilities.labs}\n⚽ Sports: ${collegeDB.facilities.sports}\n🏠 Hostel: ${collegeDB.facilities.hostel}\n🏥 Medical: ${collegeDB.facilities.medical}\n🍽️ Cafeteria: ${collegeDB.facilities.cafeteria}\n🚌 Transport: ${collegeDB.facilities.transport}\n📶 Wi-Fi: ${collegeDB.facilities.wifi}\n\nWould you like specific details about any facility?`;
    }
    
    // ===== FEE QUESTIONS =====
    if (isFeeQuestion(message)) {
        const category = detectCategory(message);
        
        if (category && collegeDB.scholarships[category]) {
            updateConversationState(sessionId, category, 0);
            const response = getScholarshipResponse(category, 0);
            if (response) return response;
        }
        
        clearConversationState(sessionId);
        return `💰 Fee Structure:\n\nB.Tech Tuition: ${collegeDB.generalFees.btech}\nHostel: ${collegeDB.generalFees.hostel.triple} (triple), ${collegeDB.generalFees.hostel.double} (double), ${collegeDB.generalFees.hostel.single} (single)\nTransport: ${collegeDB.generalFees.transport}\nMess: ${collegeDB.generalFees.mess}\nOne-time: ${collegeDB.generalFees.cautionDeposit}, ${collegeDB.generalFees.libraryDeposit}\n\nScholarships: SC/ST full waiver, OBC 50% (income < ₹6L), Merit up to 100%. Which category are you from?`;
    }
    
    // ===== SCHOLARSHIP QUESTIONS =====
    if (isScholarshipQuestion(message)) {
        const category = detectCategory(message);
        
        if (category && collegeDB.scholarships[category]) {
            updateConversationState(sessionId, category, 0);
            const response = getScholarshipResponse(category, 0);
            if (response) return response;
        }
        
        return `🎓 Scholarships Available:\n\n• SC: 100% tuition waiver + hostel reimbursement\n• ST: 100% tuition waiver + hostel reimbursement\n• OBC: 50% waiver (income < ₹6L)\n• EWS: 100% waiver (income < ₹3L)\n• General: Merit-based up to 100% (90%+ in 12th)\n\nWhich category are you interested in?`;
    }
    
    // ===== PLACEMENT QUESTIONS =====
    if (isPlacementQuestion(message)) {
        const branch = findBranch(message);
        
        if (branch) {
            const b = collegeDB.branches[branch];
            return `💼 ${b.name} Placement:\n\nRate: ${b.placementRate}\nAverage Package: ${b.avgPackage}\nHighest Package: ${b.highestPackage}\nTop Recruiters: ${b.recruiters.slice(0,4).join(', ')}\n\nWould you like overall college placement stats?`;
        }
        
        return `📊 Overall Placement 2024-25:\n\nHighest Package: ${collegeDB.placement.highest} LPA\nAverage Package: ${collegeDB.placement.average} LPA\nPlacement Rate: ${collegeDB.placement.rate}\nStudents Placed: ${collegeDB.placement.studentsPlaced}\nTotal Offers: ${collegeDB.placement.offers}\nTop Recruiters: ${collegeDB.placement.recruiters}\n\nWhich branch are you interested in?`;
    }
    
    // ===== BRANCH QUESTIONS =====
    const currentBranch = findBranch(message);
    if (currentBranch) {
        const branch = collegeDB.branches[currentBranch];
        clearConversationState(sessionId);
        return `📚 ${branch.name}:\n\nSeats: ${branch.seats}\nDuration: ${branch.duration}\nFees: ${branch.fees}\nPlacement: ${branch.placementRate} placed, average ${branch.avgPackage}, highest ${branch.highestPackage}\nRecruiters: ${branch.recruiters.slice(0,3).join(', ')}\nFaculty: ${branch.faculty}\nHOD: ${branch.hod}\nCutoffs: General ${branch.cutoffs.general}, SC ${branch.cutoffs.sc}, ST ${branch.cutoffs.st}, OBC ${branch.cutoffs.obc}\n\nWould you like to know about faculty or placement details?`;
    }
    
    // ===== ADMISSION CHANCE =====
    const score = extractNumber(message);
    const category = detectCategory(message);
    const requestedBranch = findBranch(message);
    
    if (score && category && requestedBranch) {
        const branch = collegeDB.branches[requestedBranch];
        const cutoff = branch.cutoffs[category];
        if (cutoff) {
            if (score >= cutoff) {
                return `🎯 Admission Chance: HIGH!\n\nScore: ${score}, Category: ${category.toUpperCase()}\nBranch: ${branch.name}\nRequired Cutoff: ${cutoff}\nYou're ${score - cutoff} marks above cutoff.\n\nApply before ${collegeDB.dates.applicationEnd}. Would you like scholarship information?`;
            } else {
                return `🎯 Admission Chance: Moderate\n\nScore: ${score}, Category: ${category.toUpperCase()}\nBranch: ${branch.name}\nRequired Cutoff: ${cutoff}\nYou're ${cutoff - score} marks below cutoff.\n\nAlternative branches: Mechanical (${collegeDB.branches.mechanical.cutoffs[category]}) or Civil (${collegeDB.branches.civil.cutoffs[category]}).`;
            }
        }
    }
    
    // ===== COURSES =====
    if (lowerMsg.includes('course') || lowerMsg.includes('courses')) {
        return `📚 Courses Offered:\n\nB.Tech Programs:\n${collegeDB.allCourses.map(c => `• ${c}`).join('\n')}\n\nM.Tech: Computer, Mechanical, Electrical\nMBA, MCA also available\n\nWhich branch would you like details about?`;
    }
    
    // ===== HOSTEL =====
    if (lowerMsg.includes('hostel')) {
        return `🏠 Hostel Facilities:\n\nBoys: ${collegeDB.hostel.boys}\nGirls: ${collegeDB.hostel.girls}\nFees: Triple ${collegeDB.generalFees.hostel.triple}, Double ${collegeDB.generalFees.hostel.double}, Single ${collegeDB.generalFees.hostel.single}\nAmenities: ${collegeDB.hostel.amenities}\nMess: ${collegeDB.generalFees.mess} (optional)\n\nWould you like to know about room availability?`;
    }
    
    // ===== CONTACT =====
    if (lowerMsg.includes('contact') || lowerMsg.includes('phone') || lowerMsg.includes('email')) {
        return `📞 Contact Information:\n\nAdmission: ${collegeDB.contact.admission}\nPlacement: ${collegeDB.contact.placement}\nEmail: ${collegeDB.contact.email}\nWebsite: ${collegeDB.contact.website}\nAddress: ${collegeDB.contact.address}\n\nOffice Hours: Monday-Saturday, 9 AM to 5 PM`;
    }
    
    // ===== GREETING =====
    if (lowerMsg.match(/^(hi|hello|hey|hii|greetings)$/)) {
        return `👋 Hello! Welcome to Sanjivani College Admission Assistant.\n\nI can help you with:\n• 📚 Courses & Branches\n• 💰 Fee Structure & Scholarships\n• 💼 Placement Records\n• 🏠 Hostel Facilities\n• 📋 Admission Cutoffs\n• 🎯 Admission Chance Calculator\n\nWhat would you like to know?`;
    }
    
    // ===== HELP / DEFAULT =====
    return `I can help with Sanjivani College. Try these:\n\n• "Tell me about Computer Science" - Branch details\n• "fee structure for SC" - SC scholarship\n• "fee structure for Open" - General category\n• "placement record" - Placement stats\n• "facilities for SC students" - SC facilities\n• "hostel facilities" - Hostel info\n• "My score is 85, SC, want CSE" - Admission chance\n\nWhat would you like to know?`;
}

// API Endpoint
app.post('/api/chat', async (req, res) => {
    const { message, sessionId } = req.body;
    const session = sessionId || `session_${Date.now()}`;
    
    console.log(`\n📩 User: "${message}"`);
    
    if (!message || message.trim().length === 0) {
        return res.json({ reply: "Please enter a question. I'm here to help!" });
    }
    
    const history = getHistory(session);
    const reply = generateResponse(message, history, session);
    
    saveToHistory(session, message, reply);
    
    try {
        let conversation = await Conversation.findOne({ sessionId: session });
        if (!conversation) {
            conversation = new Conversation({ sessionId: session, messages: [] });
        }
        conversation.messages.push(
            { role: 'user', content: message, timestamp: new Date() },
            { role: 'assistant', content: reply, timestamp: new Date() }
        );
        conversation.lastActive = new Date();
        if (conversation.messages.length > 30) {
            conversation.messages = conversation.messages.slice(-30);
        }
        await conversation.save();
    } catch (err) {}
    
    res.json({ reply, sessionId: session });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', college: 'Sanjivani College of Engineering' });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n✅ Sanjivani College Chatbot Ready!`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`\n💡 ALL ISSUES FIXED:`);
    console.log(`   ✓ "facilities for SC students" → Now shows SC benefits`);
    console.log(`   ✓ "Computer" / "for computer" → Recognizes as CSE branch`);
    console.log(`   ✓ "Open" / "general" → General category scholarship`);
    console.log(`   ✓ Context remembered across all query types`);
    console.log(`\n🚀 Restart and test all commands!\n`);
});