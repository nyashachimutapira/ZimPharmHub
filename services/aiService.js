// AI Service for OpenAI integration
// This service handles all AI/ML operations for the platform

const axios = require('axios');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = 'https://api.openai.com/v1';

// Initialize OpenAI client (if API key is available)
let openai = null;
if (OPENAI_API_KEY) {
  try {
    const { Configuration, OpenAIApi } = require('openai');
    const configuration = new Configuration({
      apiKey: OPENAI_API_KEY,
    });
    openai = new OpenAIApi(configuration);
  } catch (error) {
    console.warn('OpenAI SDK not installed. Using axios for API calls.');
  }
}

/**
 * Generate job recommendations based on user skills
 */
exports.generateJobRecommendations = async (userSkills, userExperience = {}, jobList = []) => {
  try {
    if (!OPENAI_API_KEY) {
      return generateLocalRecommendations(userSkills, userExperience, jobList);
    }

    const prompt = `
You are a professional recruiter analyzing job fit for a pharmacy professional.

User Skills: ${userSkills.map(s => s.skillName).join(', ')}
Experience: ${JSON.stringify(userExperience)}

Available Jobs:
${jobList.slice(0, 10).map(j => `- ${j.title} at ${j.company}`).join('\n')}

Based on the user's skills and experience, recommend the top 3-5 jobs that would be the best fit.
Provide a score (0-100) for each recommendation and explain why it's a good match.

Format your response as JSON:
{
  "recommendations": [
    {
      "jobId": "id",
      "title": "job title",
      "matchScore": 85,
      "reason": "explanation",
      "matchedSkills": ["skill1", "skill2"],
      "missingSkills": ["skill3"]
    }
  ]
}`;

    const response = await makeOpenAICall(prompt, 'recommendations');
    return response;
  } catch (error) {
    console.error('Error generating recommendations:', error.message);
    return generateLocalRecommendations(userSkills, userExperience, jobList);
  }
};

/**
 * Calculate job match score between user and job
 */
exports.calculateJobMatchScore = async (userSkills, userExperience, jobDescription) => {
  try {
    if (!OPENAI_API_KEY) {
      return calculateLocalMatchScore(userSkills, userExperience, jobDescription);
    }

    const prompt = `
Analyze how well this candidate matches the job requirements.

Candidate Skills: ${userSkills.map(s => s.skillName).join(', ')}
Candidate Experience (years): ${userExperience.yearsInPharmacy || 0}

Job Description:
${jobDescription}

Provide a detailed match analysis with:
1. Overall match score (0-100)
2. Skill match percentage
3. Experience match percentage
4. Education match percentage
5. List of matched skills
6. List of missing skills
7. Brief recommendation

Format as JSON:
{
  "matchScore": 75,
  "skillMatch": 80,
  "experienceMatch": 70,
  "educationMatch": 65,
  "matchedSkills": ["skill1"],
  "missingSkills": ["skill2"],
  "recommendation": "Good fit but needs training in..."
}`;

    const response = await makeOpenAICall(prompt, 'match_analysis');
    return response;
  } catch (error) {
    console.error('Error calculating match score:', error.message);
    return calculateLocalMatchScore(userSkills, userExperience, jobDescription);
  }
};

/**
 * Parse resume text using AI
 */
exports.parseResumeText = async (resumeText) => {
  try {
    if (!OPENAI_API_KEY) {
      return parseResumeLocally(resumeText);
    }

    const prompt = `
Extract structured information from this resume:

${resumeText}

Extract and structure the following information:
1. Full name
2. Contact information (email, phone)
3. Professional summary
4. Work experience (job title, company, duration, achievements)
5. Education (degree, school, graduation year)
6. Skills (with estimated proficiency)
7. Certifications and licenses
8. Languages
9. Projects

Format as JSON with proper arrays and objects.`;

    const response = await makeOpenAICall(prompt, 'resume_parse');
    return response;
  } catch (error) {
    console.error('Error parsing resume:', error.message);
    return parseResumeLocally(resumeText);
  }
};

/**
 * Generate job description using AI
 */
exports.generateJobDescription = async (jobTitle, company, responsibilities, requirements, salary) => {
  try {
    if (!OPENAI_API_KEY) {
      return generateJobDescriptionLocally(jobTitle, company, responsibilities, requirements, salary);
    }

    const prompt = `
Generate a professional job description for a pharmacy position.

Job Title: ${jobTitle}
Company: ${company}
Key Responsibilities: ${responsibilities}
Requirements: ${requirements}
Salary Range: ${salary}

Create a well-formatted job description that includes:
1. Job summary (2-3 sentences)
2. Key responsibilities (5-7 bullet points)
3. Required qualifications (5-7 bullet points)
4. Preferred qualifications (3-5 bullet points)
5. Benefits and compensation
6. Application instructions

Make it compelling and professional for pharmacy professionals.`;

    const response = await makeOpenAICall(prompt, 'job_description');
    return response;
  } catch (error) {
    console.error('Error generating job description:', error.message);
    return generateJobDescriptionLocally(jobTitle, company, responsibilities, requirements, salary);
  }
};

/**
 * Predict salary based on job title, experience, and location
 */
exports.predictSalary = async (jobTitle, experience, location = 'Zimbabwe') => {
  try {
    if (!OPENAI_API_KEY) {
      return predictSalaryLocally(jobTitle, experience, location);
    }

    const prompt = `
Predict salary range for a pharmacy professional role.

Job Title: ${jobTitle}
Years of Experience: ${experience}
Location: ${location}

Based on market data for Zimbabwe and the pharmacy industry, provide:
1. Minimum expected salary (ZWL)
2. Average expected salary (ZWL)
3. Maximum expected salary (ZWL)
4. Salary factors explanation
5. Career growth potential

Format as JSON:
{
  "minSalary": 50000,
  "avgSalary": 75000,
  "maxSalary": 100000,
  "currency": "ZWL",
  "factors": "explanation",
  "growthPotential": "description"
}`;

    const response = await makeOpenAICall(prompt, 'salary_prediction');
    return response;
  } catch (error) {
    console.error('Error predicting salary:', error.message);
    return predictSalaryLocally(jobTitle, experience, location);
  }
};

/**
 * Make OpenAI API call
 */
async function makeOpenAICall(prompt, type = 'general') {
  try {
    const response = await axios.post(
      `${OPENAI_BASE_URL}/chat/completions`,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional recruiter and career advisor specializing in pharmacy roles. Always respond with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0].message.content;
    
    // Try to parse JSON response
    try {
      return JSON.parse(content);
    } catch (e) {
      // If not JSON, return as text
      return { success: true, data: content };
    }
  } catch (error) {
    console.error(`OpenAI API error (${type}):`, error.message);
    throw error;
  }
}

/**
 * Local implementations (fallback when API is not available)
 */

function generateLocalRecommendations(userSkills, userExperience, jobList) {
  const skillNames = userSkills.map(s => s.skillName.toLowerCase());
  
  return {
    recommendations: jobList.slice(0, 5).map(job => {
      const jobSkillsRequired = (job.requirements || '').toLowerCase();
      const matchedSkills = skillNames.filter(skill =>
        jobSkillsRequired.includes(skill)
      );
      const matchScore = Math.min(100, (matchedSkills.length / Math.max(1, skillNames.length)) * 100);
      
      return {
        jobId: job.id,
        title: job.title,
        matchScore: Math.round(matchScore),
        reason: `${matchedSkills.length} of your skills match this role`,
        matchedSkills,
        missingSkills: skillNames.filter(s => !matchedSkills.includes(s)),
      };
    }),
  };
}

function calculateLocalMatchScore(userSkills, userExperience, jobDescription) {
  const skillNames = userSkills.map(s => s.skillName.toLowerCase());
  const jobDescLower = jobDescription.toLowerCase();
  
  const matchedSkills = skillNames.filter(skill => jobDescLower.includes(skill));
  const skillMatch = (matchedSkills.length / Math.max(1, skillNames.length)) * 100;
  
  const yearsRequired = extractYearsFromText(jobDescription);
  const yearsAvailable = userExperience.yearsInPharmacy || 0;
  const experienceMatch = Math.min(100, (yearsAvailable / Math.max(1, yearsRequired)) * 100);
  
  const matchScore = (skillMatch * 0.6 + experienceMatch * 0.4);
  
  return {
    matchScore: Math.round(matchScore),
    skillMatch: Math.round(skillMatch),
    experienceMatch: Math.round(experienceMatch),
    educationMatch: 75,
    matchedSkills,
    missingSkills: skillNames.filter(s => !matchedSkills.includes(s)),
    recommendation: matchScore > 70 ? 'Good fit' : 'Consider upskilling',
  };
}

function parseResumeLocally(resumeText) {
  // Simple regex-based resume parsing
  const lines = resumeText.split('\n').filter(l => l.trim());
  
  return {
    fullName: extractName(lines[0]) || 'Unknown',
    email: extractEmail(resumeText),
    phone: extractPhone(resumeText),
    summary: extractSection(resumeText, 'summary|objective|profile'),
    experience: extractExperience(resumeText),
    education: extractEducation(resumeText),
    skills: extractSkills(resumeText),
    certifications: extractCertifications(resumeText),
    languages: [],
  };
}

function generateJobDescriptionLocally(jobTitle, company, responsibilities, requirements, salary) {
  return {
    jobTitle,
    company,
    summary: `We are looking for a ${jobTitle} to join ${company}. This is an exciting opportunity to contribute your expertise in a dynamic healthcare environment.`,
    responsibilities: (responsibilities || '').split(',').map(r => r.trim()),
    requirements: (requirements || '').split(',').map(r => r.trim()),
    salary: `${salary || 'Competitive'}`,
    applicationInstructions: 'Apply through the ZimPharmHub platform with your resume and cover letter.',
  };
}

function predictSalaryLocally(jobTitle, experience, location) {
  // Base salary ranges for Zimbabwe pharmacy roles
  const baseSalaries = {
    'pharmacist': { min: 100000, avg: 150000, max: 200000 },
    'pharmacy assistant': { min: 30000, avg: 50000, max: 70000 },
    'pharmacy technician': { min: 40000, avg: 65000, max: 90000 },
    'pharmacy manager': { min: 120000, avg: 180000, max: 250000 },
    'clinical pharmacist': { min: 110000, avg: 160000, max: 210000 },
  };
  
  const roleKey = jobTitle.toLowerCase();
  const baseSalary = baseSalaries[roleKey] || { min: 50000, avg: 75000, max: 100000 };
  
  // Adjust for experience
  const experienceMultiplier = 1 + (experience / 100);
  
  return {
    minSalary: Math.round(baseSalary.min * experienceMultiplier),
    avgSalary: Math.round(baseSalary.avg * experienceMultiplier),
    maxSalary: Math.round(baseSalary.max * experienceMultiplier),
    currency: 'ZWL',
    factors: `Based on ${experience} years of experience in the pharmacy industry in ${location}`,
    growthPotential: 'Good opportunities for advancement with continued professional development',
  };
}

// Helper functions
function extractEmail(text) {
  const match = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  return match ? match[0] : null;
}

function extractPhone(text) {
  const match = text.match(/\+?263\d{9}|0\d{9}/);
  return match ? match[0] : null;
}

function extractName(text) {
  const words = text.split(/\s+/).filter(w => w.length > 2);
  return words.slice(0, 3).join(' ') || null;
}

function extractSection(text, sectionName) {
  const regex = new RegExp(`${sectionName}:?\\s*(.+?)(?=\\n[A-Z]|$)`, 'ims');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}

function extractExperience(text) {
  const experienceSection = extractSection(text, 'experience|employment|work history');
  if (!experienceSection) return [];
  
  return experienceSection.split('\n').filter(l => l.trim()).slice(0, 5).map(line => ({
    title: line.split(' at ')[0] || line,
    company: line.split(' at ')[1] || 'Unknown',
  }));
}

function extractEducation(text) {
  const educationSection = extractSection(text, 'education');
  if (!educationSection) return [];
  
  return educationSection.split('\n').filter(l => l.trim()).slice(0, 3).map(line => ({
    school: line,
  }));
}

function extractSkills(text) {
  const skillsSection = extractSection(text, 'skills');
  if (!skillsSection) return [];
  
  return skillsSection.split(/[,;]/).map(s => s.trim()).filter(s => s.length > 0).slice(0, 10);
}

function extractCertifications(text) {
  const certSection = extractSection(text, 'certification|license');
  if (!certSection) return [];
  
  return certSection.split(/[,;]/).map(c => c.trim()).filter(c => c.length > 0).slice(0, 5);
}

function extractYearsFromText(text) {
  const match = text.match(/(\d+)\s*(?:years?|yrs?)/i);
  return match ? parseInt(match[1]) : 3;
}

module.exports.initializeAI = () => {
  console.log(`AI Service initialized. OpenAI available: ${!!OPENAI_API_KEY}`);
  if (!OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not set. Using local fallback implementations.');
  }
};
