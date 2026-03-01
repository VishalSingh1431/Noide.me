import Groq from 'groq-sdk';
import mammoth from 'mammoth';

// ─── Regex-based fallback parser (no API needed) ───────────────────────────────

function extractWithRegex(rawText) {
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

    // Extract email
    const emailMatch = rawText.match(/[\w.-]+@[\w.-]+\.\w{2,}/);
    const email = emailMatch ? emailMatch[0] : null;

    // Extract phone
    const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const phone = phoneMatch ? phoneMatch[0] : null;

    // Extract name (usually first non-empty line)
    let name = 'Unknown';
    for (const line of lines) {
        if (line.length > 2 && line.length < 60 &&
            !line.includes('@') && !line.match(/^\d/) &&
            !line.match(/^https?:\/\//) && !line.match(/^(summary|objective|experience|education|skills|projects)/i)) {
            name = line;
            break;
        }
    }

    // Location
    const locationMatch = rawText.match(/(?:(?:location|address|city)\s*[:\-]\s*)(.+)/i) ||
        rawText.match(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)*,\s*[A-Z]{2,}(?:\s*\d{5,6})?)/);
    const location = locationMatch ? (locationMatch[1] || locationMatch[0]).trim() : null;

    // Skills — find common tech keywords
    const techKeywords = [
        'JavaScript', 'TypeScript', 'Python', 'Java', 'C\\+\\+', 'C#', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
        'React', 'Angular', 'Vue', 'Next\\.js', 'Node\\.js', 'Express', 'Django', 'Flask', 'Spring',
        'HTML', 'CSS', 'SASS', 'Tailwind', 'Bootstrap',
        'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase', 'Supabase',
        'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
        'Git', 'Linux', 'REST', 'GraphQL', 'SQL', 'NoSQL',
        'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch',
        'Figma', 'Photoshop', 'UI/UX'
    ];
    const foundSkills = [];
    for (const keyword of techKeywords) {
        if (new RegExp(`\\b${keyword}\\b`, 'i').test(rawText)) {
            foundSkills.push({ name: keyword.replace(/\\\./g, '.').replace(/\\\+/g, '+'), pct: 70 + Math.floor(Math.random() * 25) });
        }
    }

    // Summary
    let summary = '';
    const summaryMatch = rawText.match(/(?:summary|objective|about\s*me|profile)\s*[:\-]?\s*\n?([\s\S]{20,300}?)(?:\n\n|\n[A-Z])/i);
    if (summaryMatch) summary = summaryMatch[1].trim();

    const titles = (rawText.match(/(?:software|web|full[\s-]?stack|frontend|backend|data|ml|devops|mobile|ui\/ux)\s*(?:developer|engineer|designer|architect|scientist|analyst)/gi) || ['Developer']).slice(0, 2);

    return {
        name, titles,
        tagline: summary ? summary.substring(0, 80) : `${name} — Professional Portfolio`,
        location, email, phone,
        summary: summary || `Professional profile for ${name}.`,
        skills: foundSkills.length > 0 ? foundSkills.slice(0, 12) : [{ name: 'See Resume', pct: 80 }],
        projects: [], experience: [], education: [],
        _parsedBy: 'regex-fallback'
    };
}

// ─── Groq AI extraction ────────────────────────────────────────────────────────

async function extractWithGroq(rawText) {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Trim text to avoid exceeding token limits
    const trimmedText = rawText.substring(0, 12000);

    const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
            {
                role: 'system',
                content: `You are an expert resume parser. Your job is to extract EVERY piece of information from a resume and return structured JSON. Be thorough — do NOT skip any skills, projects, jobs, or education entries. Extract ALL of them.

CRITICAL RULES:
- Return ONLY a valid JSON object, no markdown fences, no explanation
- Extract EVERY skill, project, experience entry, and education entry found
- For skills, estimate proficiency (pct) based on context: listed first or emphasized = 85-95, mentioned = 70-84, basic/learning = 50-69
- For projects, extract the tech stack from the description if not explicitly listed
- Use a relevant emoji for each project (🌐 for web, 📱 for mobile, 🤖 for AI, etc.)
- Write a compelling 1-2 sentence tagline from the person's profile
- Write a professional 2-3 sentence summary
- If a field is truly not in the resume, use null (for strings) or [] (for arrays)`
            },
            {
                role: 'user',
                content: `Parse this resume thoroughly. Extract EVERY skill, project, job, and degree. Return JSON with this exact structure:

{
    "name": "Full Name",
    "titles": ["Primary Title", "Secondary Title"],
    "tagline": "A compelling one-liner about this person",
    "location": "City, State/Country",
    "email": "email@example.com",
    "phone": "+1-234-567-8900",
    "summary": "A professional 2-3 sentence summary highlighting key strengths and experience.",
    "skills": [
        { "name": "Skill Name", "pct": 90 }
    ],
    "projects": [
        { "title": "Project Name", "desc": "What it does, 1-2 sentences", "tech": ["React", "Node.js"], "emoji": "🚀" }
    ],
    "experience": [
        { "role": "Job Title", "company": "Company Name", "period": "Jan 2023 - Present", "desc": "Key responsibilities and achievements in 1-2 sentences" }
    ],
    "education": [
        { "degree": "B.Tech in Computer Science", "school": "University Name", "year": "2020-2024", "gpa": "8.5/10" }
    ]
}

RESUME TEXT:
${trimmedText}`
            }
        ],
        temperature: 0.2,
        max_tokens: 4096,
        response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    console.log('Groq raw response length:', content.length);

    // Try direct JSON parse first (since we use json_object format)
    let parsed;
    try {
        parsed = JSON.parse(content);
    } catch {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Groq did not return valid JSON');
        parsed = JSON.parse(jsonMatch[0]);
    }

    parsed._parsedBy = 'groq-llama3';
    return parsed;
}


// ─── Main Controller ───────────────────────────────────────────────────────────

export const parseResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        let rawText = '';
        const buffer = req.file.buffer;
        console.log('📄 File received:', req.file.originalname, 'Mime:', req.file.mimetype, 'Size:', buffer.length);

        // 1. Extract raw text
        if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            console.log('📖 Parsing DOCX...');
            const result = await mammoth.extractRawText({ buffer });
            rawText = result.value;
            console.log('✅ DOCX text extracted, length:', rawText.length);
        } else {
            return res.status(400).json({ message: 'Unsupported file type. Please upload DOCX.' });
        }

        if (!rawText || rawText.trim().length === 0) {
            return res.status(400).json({ message: 'No text could be extracted.' });
        }

        // 2. Try Groq AI → fallback to regex
        let parsedData;

        if (process.env.GROQ_API_KEY) {
            try {
                console.log('🤖 Calling Groq AI (llama3-8b-8192)...');
                parsedData = await extractWithGroq(rawText);
                console.log('✅ Groq extraction successful for:', parsedData.name);
            } catch (groqError) {
                console.warn('⚠️ Groq failed:', groqError.message);
                console.log('🔄 Falling back to regex parser...');
                parsedData = extractWithRegex(rawText);
                console.log('✅ Regex fallback done for:', parsedData.name);
            }
        } else {
            console.log('ℹ️ No GROQ_API_KEY, using regex parser...');
            parsedData = extractWithRegex(rawText);
        }

        res.status(200).json(parsedData);

    } catch (error) {
        console.error('❌ Resume Parse Error:', error);
        res.status(500).json({ message: 'Extraction failed', error: error.message });
    }
};

export const savePortfolio = async (req, res) => {
    try {
        res.status(200).json({ message: 'Portfolio saved successfully', data: req.body });
    } catch (error) {
        res.status(500).json({ message: 'Save failed' });
    }
};

export const getPortfolio = async (req, res) => {
    try {
        res.status(200).json({ message: 'Feature coming soon' });
    } catch (error) {
        res.status(500).json({ message: 'Fetch failed' });
    }
};
