/**
 * AI Literacy Assessment Application
 * 
 * This application provides an interactive questionnaire to assess AI literacy
 * across four key areas: Delegation, Communication, Discernment, and Keeping it Twilio.
 * 
 * Features:
 * - 15 questions based on a 4-stage maturity model
 * - Progress tracking and navigation
 * - Score calculation and results visualization
 * - Dark mode support
 * - Print/PDF export capability
 * 
 * Note: This is Milestone 1 with real question data. Milestone 2 will add
 * localStorage persistence and assessment history.
 */

// Application State
const state = {
    currentQuestionIndex: 0,  // Current question being displayed (0-indexed)
    answers: {},               // User's answers stored as { questionId: value }
    questions: [],             // Array of question objects
    categories: [],            // Array of category objects
    currentSection: 0,         // Current section index (0-3)
    sections: [],              // Array of section objects with questions
    userContext: {             // User's role information for personalized recommendations
        jobTitle: '',
        team: '',
        subDepartment: '',
        jobLevel: '',
        aiFrequency: '',
        aiToolsUsed: [],
        workFocus: ''
    }
};

/**
 * Normalize answers to support multi-select.
 * Historical saved progress may store a single number; we now store an array of numbers.
 */
function normalizeAnswerValue(value) {
    if (Array.isArray(value)) return value;
    if (typeof value === 'number') return [value];
    return [];
}

function getAnswersArray(questionId) {
    const normalized = normalizeAnswerValue(state.answers[questionId]);
    state.answers[questionId] = normalized;
    return normalized;
}

/**
 * Maturity Levels - 4-stage progression model
 * Each question maps to one of these maturity levels
 */
const maturityLevels = [
    { value: 1, label: 'Not Started', color: '#d61f1f' },   // Red - Twilio Paste error color
    { value: 2, label: 'Compliant', color: '#0891b2' },     // Teal - Neutral, progress-oriented
    { value: 3, label: 'Competent', color: '#14b053' },     // Green - Twilio Paste success color
    { value: 4, label: 'Creative', color: '#0263e0' }       // Blue - Twilio Paste primary color
];

/**
 * Job Level Expectations
 * Maps job levels to their key expectations for contextual AI recommendations
 */
const jobLevelExpectations = {
    'S1': 'Learns job skills, follows instructions closely, works on simple tasks',
    'S2': 'Uses learned job skills, begins learning complex skills, works on routine tasks',
    'S3': 'Works independently with competence, handles moderately difficult tasks requiring judgment',
    'S4': 'Skilled specialist who works independently and assists others, good judgment and innovation',
    'S5': 'Highly skilled specialist who improves processes, advises others, works on interdisciplinary projects',
    'P1': 'Learning basic job skills as part of a team, completing discrete tasks',
    'P2': 'Has basic knowledge and growing skills, addresses moderately challenging but routine problems',
    'P3': 'Has solid, fully developed skills, uses evaluation and analysis to solve problems and improve processes',
    'P4': 'Advanced skill proficiency with deep subject matter expertise, solves complex problems, often mentors others',
    'P5': 'Recognized expert with deep specialization, solves unique or ambiguous challenges, acts as internal consultant',
    'P6': 'Visionary technical leader whose expertise drives significant advancements, influences programs and organizational direction',
    'P7': 'Applies deep technical expertise in current and emerging technologies, oversees engineering research and advanced projects',
    'M2': 'Leads with clear objectives, solves routine problems, supervises skilled individual contributors or teams',
    'M3': 'Makes decisions about resources and goals, solves wide range of problems, manages multiple teams',
    'M4': 'Sets goals for larger areas, handles difficult and ambiguous problems, oversees multiple disciplines or departments',
    'M5': 'Collaborates with senior leaders to define strategy, navigates undefined problems, influences long-term results',
    'M6': 'Creates vision and strategy affecting significant portion of company, influences board-level decisions',
    'E7': 'Expert in business area and industry, leads complex cross-functional efforts, translates strategy into 2-5 year plans',
    'E8': 'Demonstrates expert knowledge, influences industry trends, drives innovation, leads area/sub-function or business line'
};

/**
 * Get Job Level Description
 * Returns a brief description of expectations for a given job level
 */
function getJobLevelDescription(jobLevel) {
    return jobLevelExpectations[jobLevel] || 'Role expectations vary';
}

/**
 * Questions Data - From AI Literacy Questionnaire PDF
 * 
 * Structure:
 * - id: Unique identifier for the question
 * - text: The question text
 * - category: One of 4 categories (Delegation, Communication, Discernment, Keeping It Twilio)
 * - type: 'maturity' (all questions use maturity model)
 * - options: Array of 4 answer options, each with value (1-4), label, and description
 * - weight: Scoring weight (currently all 1.0)
 * 
 * Based on 4-stage maturity model: Not Started, Compliant, Competent, Creative
 */
const dummyQuestions = [
    // Section 1: Delegation to AI Systems
    {
        id: 'q1',
        text: 'Platform Awareness: When selecting which AI tool, model or service to use...',
        category: 'Delegation',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I use the most convenient tool available to me at that moment.'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I only use AI tools approved by my organization at work, and whatever I want at home'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I change the model in the Gemini WebApp (ie. Fast, Thinking, Pro) based on the complexity of the task I\'m working on.'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I use different AI models and services (ie. Gemini, Claude, ChatGPT) based on their individual strengths and weaknesses'
            }
        ],
        weight: 1.0
    },
    {
        id: 'q2',
        text: 'Task decomposition: When planning and sharing a plan with AI tools and systems...',
        category: 'Delegation',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I ask the AI to handle the entire project or large, complex task in a single prompt'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I break the project down into smaller, logical steps before I start prompting'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I collaborate with AI to outline the necessary steps for a project before asking it to execute on any of them'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I use a chain-of-thought approach, where I have the AI solve one piece of the puzzle and then revise and use that to inform the next output and prompt'
            }
        ],
        weight: 1.0
    },
    // Section 2: Communication & Clarity
    {
        id: 'q4',
        text: 'Steering AI systems: When working with AI tools and systems...',
        category: 'Communication',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I focus on getting a quick draft that I can manually edit, fix or finish'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I specify the exact format, length, or tone I expect the final result to have'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I provide one or more examples of what good looks like (ie. one/few-shot prompting)'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I steer the model\'s behavior and output with both positive and negative examples of the desired output'
            }
        ],
        weight: 1.0
    },
    {
        id: 'q5',
        text: 'Process Clarity: When instructing AI tools and systems...',
        category: 'Communication',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I treat the AI as a "black box," focusing only on the final answer'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I ask the AI to explain its logic to ensure I can audit its reasoning after the fact.'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I instruct the AI to pause and ask me clarifying questions before it starts generating a long response.'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I ask the AI to provide multiple different versions or drafts so I can evaluate which process or path is most effective.'
            }
        ],
        weight: 1.0
    },
    {
        id: 'q6',
        text: 'Performance Expectations: When setting expectations for projects while working with AI tools,',
        category: 'Communication',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I assume the AI will get the answer right on the first try'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I budget time for a manual human review to catch hallucinations or formatting errors.'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I set "success criteria" for the AI, asking it to verify its own work against my specific requirements before finishing.'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I anticipate where the AI might struggle (e.g., complex math or niche data) and proactively consider how I might mitigate those risks.'
            }
        ],
        weight: 1.0
    },
    {
        id: 'q7',
        text: 'Context Aggregation: When providing context to AI models...',
        category: 'Communication',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I copy and paste small snippets of information as I think of them.'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I upload or paste relevant documents, spreadsheets, images or PDFs with a prompt when helpful.'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I curate and distill the information first, removing "noise" so the AI focuses only on the most high-value data points.'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I create knowledge libraries that connect the AI to multiple vetted data sources for a more holistic view.'
            }
        ],
        weight: 1.0
    },
    // Section 3: Discernment
    {
        id: 'q8',
        text: 'Domain/Craft Expertise: When evaluating AI-generated outputs...',
        category: 'Discernment',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I accept the output as a finished product if it sounds professional and grammatically correct.'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I check the output against my initial prompt to ensure all my specific requirements were met.'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I manually edit AI outputs using my domain expertise — checking for accuracy, fixing nuances the AI missed, and making sure it meets industry or brand standards.'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I run AI outputs through multiple rounds of refinement — feeding it back into AI with targeted follow-up prompts to stress-test, challenge assumptions, and push quality beyond what either of us would produce alone.'
            }
        ],
        weight: 1.0
    },
    {
        id: 'q9',
        text: 'Coaching for Improvement: When providing feedback to refine AI outputs...',
        category: 'Discernment',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I usually give up or start a new chat if the first response isn\'t what I wanted.'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I tell the AI what I didn\'t like (e.g., "This is too long") and ask it to try again.'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I provide "constructive criticism" by explaining exactly what was wrong and how to fix it (e.g., "The tone is too formal; make it more conversational").'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I treat the interaction as a coaching session, explaining the underlying principles of the task so the AI adapts to handle similar tasks better for the rest of the conversation (note: Gemini conversation history is kept for 60 days, then deleted).'
            }
        ],
        weight: 1.0
    },
    // Section 4: Keeping it Twilio
    {
        id: 'q10',
        text: 'Data Stewardship: When managing data privacy and security with AI...',
        category: 'Keeping It Twilio',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I use free or freemium AI tools (like the free version of ChatGPT) with any data I have on hand to get the job done quickly.'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I only use Non-Approved (free) AI tools with Public Data (e.g., published blogs, press releases, or SEC filings) and ensure all other work stays within Twilio-Approved platforms via Okta SSO.'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I distinguish between Confidential and Restricted data, ensuring that I only input sensitive information (like customer content, PII, or internal roadmaps) into Approved GenAI products after verifying the required Privacy Impact Assessments are complete.'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I proactively protect Twilio\'s IP by ensuring Input Data is not used for training third-party models, and I help my team navigate the ServiceNow approval process for complex new use cases involving sensitive or "Restricted" data.'
            }
        ],
        weight: 1.0
    },
    {
        id: 'q11',
        text: 'Bias & Fairness Awareness: When identifying and mitigating AI-generated bias...',
        category: 'Keeping It Twilio',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I assume the AI is a neutral tool and that its outputs are naturally objective.'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I scan outputs for obvious stereotypes or exclusionary language before using the content.'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I proactively ask the AI to consider multiple perspectives or check for bias during the prompting process.'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I bring a level of awareness of bias that is inherent to AI and use direct, specific prompts to introduce diversity and inclusion where needed and necessary'
            }
        ],
        weight: 1.0
    },
    {
        id: 'q12',
        text: 'AI Literacy: As it relates to how AI works ...',
        category: 'Keeping It Twilio',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I treat the AI as a search engine or a database that knows more than I do and retrieves them.'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I understand that AI uses inference to predict the next likely word'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I am aware of the specific training data cutoff dates and the technical architecture (e.g., context window limits) of the models I use.'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I stay up to date with the underlying mechanics of new model releases to strategically choose the right engine for the right job'
            }
        ],
        weight: 1.0
    }
];

/**
 * Categories - Based on AI Literacy Questionnaire
 * Four key areas of AI literacy assessment
 */
const dummyCategories = [
    { 
        name: 'Delegation', 
        description: 'Making thoughtful decisions about what work to hand over to AI systems',
        fullDescription: 'Delegation is about making thoughtful decisions about what work you should hand over to AI systems, and what work you should continue to manage on your own. Effective delegation requires both domain expertise and a comprehensive understanding of current AI capabilities.'
    },
    { 
        name: 'Communication', 
        description: 'Clear communication when working with AI systems',
        fullDescription: 'Clear communication is essential when working with AI systems. How you articulate your intention, standards and expectations makes the difference when writing prompts or designing AI systems that automate multiple stages of work.'
    },
    { 
        name: 'Discernment', 
        description: 'Evaluating AI outputs and behavior with a critical eye',
        fullDescription: 'Discernment is about evaluating AI outputs and behavior with a critical eye. It is your responsibility to act as the final filter, making sure the logic, accuracy, and quality of an output meet your standards rather than accepting results at face value.'
    },
    { 
        name: 'Keeping It Twilio', 
        description: 'Smart, responsible and ethical AI collaborations aligned with Twilio values',
        fullDescription: 'Keeping it Twilio focuses on smart, responsible and ethical AI collaborations. You are a steward of the company\'s integrity, making sure that AI use lines up with organizational values, legal standards, and ethical best practices.'
    }
];

/**
 * Initialize Application
 * Sets up event listeners and loads question data
 */
function init() {
    state.questions = dummyQuestions;
    state.categories = dummyCategories;
    
    // Organize questions into sections by category
    state.sections = state.categories.map(category => ({
        name: category.name,
        description: category.description,
        fullDescription: category.fullDescription,
        questions: state.questions.filter(q => q.category === category.name)
    }));
    
    // Set up event listeners
    document.getElementById('start-btn').addEventListener('click', startAssessment);
    document.getElementById('next-btn').addEventListener('click', nextQuestion);
    document.getElementById('prev-btn').addEventListener('click', prevQuestion);
    document.getElementById('submit-btn').addEventListener('click', submitAssessment);
    document.getElementById('restart-btn').addEventListener('click', restartAssessment);
    document.getElementById('print-btn').addEventListener('click', printReport);
    
    // Sub-department toggle: show/hide based on team selection
    initSubDepartmentToggle();
    
    // "None" checkbox mutual exclusion for AI tools
    initAiToolsCheckboxes();
    
    // About accordion toggle
    initAboutAccordion();
    
    // Methodology modal
    initMethodologyModal();
    
    // Dark mode toggle
    initThemeToggle();
    
    // Load saved progress
    loadProgress();
}

/**
 * Save Progress to localStorage
 */
function saveProgress() {
    const progressData = {
        currentQuestionIndex: state.currentQuestionIndex,
        currentSection: state.currentSection,
        answers: state.answers,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('assessmentProgress', JSON.stringify(progressData));
}

/**
 * Load Progress from localStorage
 */
function loadProgress() {
    const savedData = localStorage.getItem('assessmentProgress');
    if (savedData) {
        try {
            const progressData = JSON.parse(savedData);
            state.currentQuestionIndex = progressData.currentQuestionIndex || 0;
            state.currentSection = progressData.currentSection || 0;
            state.answers = progressData.answers || {};

            // Migration: older versions stored a single number per question.
            Object.keys(state.answers).forEach((questionId) => {
                state.answers[questionId] = normalizeAnswerValue(state.answers[questionId]);
            });
            
            // Check if there's progress to restore
            if (Object.keys(state.answers).length > 0) {
                const resumePrompt = confirm('You have saved progress. Would you like to continue where you left off?\n\nClick OK to continue or Cancel to start fresh.');
                if (resumePrompt) {
                    showScreen('questionnaire-screen');
                    renderQuestion();
                } else {
                    clearProgress();
                }
            }
        } catch (e) {
            console.error('Error loading progress:', e);
            clearProgress();
        }
    }
}

/**
 * Clear Progress from localStorage
 */
function clearProgress() {
    localStorage.removeItem('assessmentProgress');
    state.currentQuestionIndex = 0;
    state.currentSection = 0;
    state.answers = {};
}

/**
 * About This Assessment Accordion
 * Toggles the expandable section on the welcome page
 */
function initAboutAccordion() {
    const toggle = document.getElementById('about-toggle');
    const content = document.getElementById('about-content');
    if (!toggle || !content) return;
    
    toggle.addEventListener('click', function() {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !isExpanded);
        if (isExpanded) {
            content.hidden = true;
        } else {
            content.hidden = false;
        }
    });
}

/**
 * Methodology Modal
 * Opens/closes the full methodology modal on the results page
 */
function initMethodologyModal() {
    const modal = document.getElementById('methodology-modal');
    const openBtn = document.getElementById('open-methodology-btn');
    const closeBtn = document.getElementById('close-methodology-btn');
    const backdrop = document.getElementById('methodology-backdrop');
    
    if (!modal) return;
    
    function openModal() {
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
        // Focus the close button for accessibility
        setTimeout(() => closeBtn && closeBtn.focus(), 100);
    }
    
    function closeModal() {
        modal.hidden = true;
        document.body.style.overflow = '';
        // Return focus to the trigger
        if (openBtn) openBtn.focus();
    }
    
    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);
    
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !modal.hidden) {
            closeModal();
        }
    });
}

/**
 * Theme Toggle - Dark/Light Mode
 * Persists user preference in localStorage
 * Handles multiple theme toggle buttons across different screens
 */
function initThemeToggle() {
    const themeToggles = document.querySelectorAll('[id^="theme-toggle"]');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Set initial theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);
    
    // Add click handler to all theme toggle buttons
    themeToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    });
}

function updateThemeIcon(theme) {
    const themeToggles = document.querySelectorAll('[id^="theme-toggle"]');
    const icon = theme === 'dark' ? '☀️' : '🌙';
    themeToggles.forEach(toggle => {
        toggle.textContent = icon;
    });
}

/**
 * Sub-Department Toggle
 * Shows a specialization dropdown when the user selects a broad team
 * that has meaningful sub-departments.
 */
const SUB_DEPARTMENTS = {
    'Engineering': ['Backend', 'Frontend', 'Infrastructure / Platform', 'Data Engineering', 'Security', 'DevOps / SRE', 'Mobile', 'Other Engineering'],
    'Product': ['Product Management', 'Product Design / UX', 'Product Analytics', 'Technical Program Management', 'Other Product'],
    'Marketing': ['Product Marketing', 'Brand / Creative', 'Demand Generation', 'Content / Communications', 'Developer Relations', 'Events', 'Other Marketing'],
    'HR / People': ['Talent Acquisition', 'Talent Development / L&D', 'Total Rewards / Compensation', 'People Operations', 'HR Business Partners', 'DEI', 'Other HR'],
    'Sales': ['Account Executives', 'Sales Engineering / Solutions', 'Sales Development (SDR/BDR)', 'Sales Operations', 'Channel / Partnerships', 'Other Sales'],
    'Customer Success': ['Customer Success Management', 'Solutions Architecture', 'Onboarding / Implementation', 'Renewals', 'Other Customer Success']
};

function initSubDepartmentToggle() {
    const teamSelect = document.getElementById('team');
    const subDeptGroup = document.getElementById('sub-dept-group');
    const subDeptSelect = document.getElementById('sub-department');
    
    teamSelect.addEventListener('change', () => {
        const team = teamSelect.value;
        const subDepts = SUB_DEPARTMENTS[team];
        
        if (subDepts) {
            // Populate options
            subDeptSelect.innerHTML = '<option value="">Select your focus area...</option>';
            subDepts.forEach(dept => {
                const opt = document.createElement('option');
                opt.value = dept;
                opt.textContent = dept;
                subDeptSelect.appendChild(opt);
            });
            subDeptGroup.style.display = '';
        } else {
            subDeptGroup.style.display = 'none';
            subDeptSelect.value = '';
        }
    });
}

/**
 * AI Tools Checkboxes — "None" mutual exclusion
 * If user checks "None", uncheck all others. If they check any tool, uncheck "None".
 */
function initAiToolsCheckboxes() {
    const checkboxes = document.querySelectorAll('input[name="ai-tools"]');
    const otherToolsInput = document.getElementById('other-tools-input');
    
    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            if (cb.value === 'None' && cb.checked) {
                // Uncheck everything else and clear other tools input
                checkboxes.forEach(other => {
                    if (other !== cb) other.checked = false;
                });
                if (otherToolsInput) otherToolsInput.value = '';
            } else if (cb.value !== 'None' && cb.checked) {
                // Uncheck "None"
                const noneCb = document.querySelector('input[name="ai-tools"][value="None"]');
                if (noneCb) noneCb.checked = false;
            }
        });
    });
    
    // If user types in "other tools", uncheck "None"
    if (otherToolsInput) {
        otherToolsInput.addEventListener('input', () => {
            if (otherToolsInput.value.trim()) {
                const noneCb = document.querySelector('input[name="ai-tools"][value="None"]');
                if (noneCb) noneCb.checked = false;
            }
        });
    }
}

/**
 * Start Assessment
 * Validates user context and transitions from welcome screen to questionnaire
 */
function startAssessment() {
    // Get and validate user context
    const jobTitle = document.getElementById('job-title').value.trim();
    const team = document.getElementById('team').value;
    const jobLevel = document.getElementById('job-level').value;
    const aiFrequency = document.getElementById('ai-frequency').value;
    const subDepartment = document.getElementById('sub-department').value;
    const workFocus = document.getElementById('work-focus').value.trim();
    
    // Collect checked AI tools
    const aiToolCheckboxes = document.querySelectorAll('input[name="ai-tools"]:checked');
    const aiToolsUsed = Array.from(aiToolCheckboxes).map(cb => cb.value);
    
    // Collect custom "other tools" text
    const otherToolsInput = document.getElementById('other-tools-input').value.trim();
    if (otherToolsInput) {
        // Split by commas and clean up each tool name
        const customTools = otherToolsInput.split(/[,;]+/).map(t => t.trim()).filter(t => t.length > 0);
        customTools.forEach(tool => {
            if (!aiToolsUsed.includes(tool)) {
                aiToolsUsed.push(tool);
            }
        });
    }
    
    if (!jobTitle) {
        alert('Please enter your job title to continue.');
        document.getElementById('job-title').focus();
        return;
    }
    
    if (!team) {
        alert('Please select your team/department to continue.');
        document.getElementById('team').focus();
        return;
    }
    
    if (!jobLevel) {
        alert('Please select your job level to continue.');
        document.getElementById('job-level').focus();
        return;
    }
    
    if (!aiFrequency) {
        alert('Please select how often you use AI tools.');
        document.getElementById('ai-frequency').focus();
        return;
    }
    
    if (!workFocus) {
        alert('Please describe what you spend most of your time on — this helps us personalize your results.');
        document.getElementById('work-focus').focus();
        return;
    }
    
    // Store user context
    state.userContext = {
        jobTitle: jobTitle,
        team: team,
        subDepartment: subDepartment,
        jobLevel: jobLevel,
        aiFrequency: aiFrequency,
        aiToolsUsed: aiToolsUsed,
        workFocus: workFocus
    };
    
    // Initialize section tracking
    state.currentSection = 0;
    state.currentQuestionIndex = 0;
    
    showScreen('questionnaire-screen');
    
    // Show the first section intro screen
    showSectionIntroScreen(0);
}

/**
 * Show Section Introduction Screen
 * Displays a full screen with section description
 * @param {number} sectionIndex - The index of the section to introduce
 */
function showSectionIntroScreen(sectionIndex) {
    const section = state.sections[sectionIndex];
    
    // Show section intro screen first
    showScreen('section-intro-screen');
    
    // Set content
    document.getElementById('section-intro-fullscreen-title').textContent = section.name;
    document.getElementById('section-intro-fullscreen-description').textContent = section.fullDescription;
    
    // Set up continue button
    const continueBtn = document.getElementById('section-intro-fullscreen-continue');
    const newContinueBtn = continueBtn.cloneNode(true);
    continueBtn.parentNode.replaceChild(newContinueBtn, continueBtn);
    
    document.getElementById('section-intro-fullscreen-continue').addEventListener('click', () => {
        showScreen('questionnaire-screen');
        renderQuestion();
    });
    
    // Set up theme toggle
    const themeToggle = document.getElementById('theme-toggle-section-intro');
    if (themeToggle) {
        const newToggle = themeToggle.cloneNode(true);
        themeToggle.parentNode.replaceChild(newToggle, themeToggle);
        document.getElementById('theme-toggle-section-intro').addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }
}

/**
 * Render Current Question
 * Displays question text, category, and answer options
 */
function renderQuestion() {
    const question = state.questions[state.currentQuestionIndex];
    const questionTextEl = document.getElementById('question-text');
    const questionSubcategoryEl = document.getElementById('question-subcategory');
    const answerOptionsEl = document.getElementById('answer-options');
    
    // Clear any active focus state from previous question
    if (document.activeElement && document.activeElement.classList.contains('answer-option')) {
        document.activeElement.blur();
    }
    
    // Extract subcategory from question text (text before the colon)
    const colonIndex = question.text.indexOf(':');
    let mainQuestion = question.text;
    let subcategory = '';
    
    if (colonIndex !== -1) {
        subcategory = question.text.substring(0, colonIndex).trim();
        mainQuestion = question.text.substring(colonIndex + 1).trim();
    }
    
    // Set question text and subcategory with ARIA labels
    questionTextEl.textContent = mainQuestion;
    questionTextEl.setAttribute('role', 'heading');
    questionTextEl.setAttribute('aria-level', '2');
    
    questionSubcategoryEl.textContent = subcategory;
    if (subcategory) {
        questionSubcategoryEl.setAttribute('aria-label', `Category: ${subcategory}`);
    }
    
    // Clear previous options
    answerOptionsEl.innerHTML = '';
    answerOptionsEl.setAttribute('role', 'group');
    answerOptionsEl.setAttribute('aria-label', 'Answer options - you may select multiple options');
    
    // Randomize answer options order
    const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
    
    // Render answer options with maturity level descriptions
    shuffledOptions.forEach((option, index) => {
        const optionEl = document.createElement('button');
        optionEl.className = 'answer-option';
        optionEl.type = 'button';
        optionEl.dataset.value = option.value;
        
        // Add ARIA attributes for screen readers
        optionEl.setAttribute('aria-label', `Option ${option.value}: ${option.label}`);
        optionEl.setAttribute('aria-describedby', `option-desc-${question.id}-${index}`);
        
        // Check if this option is already selected (multi-select support)
        const currentAnswers = state.answers[question.id] || [];
        if (currentAnswers.includes(option.value)) {
            optionEl.classList.add('answer-option--selected');
            optionEl.setAttribute('aria-pressed', 'true');
        } else {
            optionEl.setAttribute('aria-pressed', 'false');
        }
        
        optionEl.innerHTML = `
            <div class="answer-option__description" id="option-desc-${question.id}-${index}">${option.description}</div>
        `;
        
        // Single click - select answer
        optionEl.addEventListener('click', () => selectAnswer(question.id, option.value));
        
        // Double click - select answer and advance
        optionEl.addEventListener('dblclick', (e) => {
            e.preventDefault();
            selectAnswer(question.id, option.value);
            
            // Add visual feedback
            optionEl.style.transform = 'scale(0.98)';
            setTimeout(() => {
                optionEl.style.transform = '';
            }, 150);
            
            // Small delay to show selection, then advance
            setTimeout(() => {
                if (state.currentQuestionIndex < state.questions.length - 1) {
                    nextQuestion();
                } else {
                    submitAssessment();
                }
            }, 200);
        });
        
        // Keyboard support - Enter key to select and advance
        optionEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectAnswer(question.id, option.value);
                
                // Add visual feedback
                optionEl.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    optionEl.style.transform = '';
                }, 150);
                
                // Small delay to show selection, then advance
                setTimeout(() => {
                    if (state.currentQuestionIndex < state.questions.length - 1) {
                        nextQuestion();
                    } else {
                        submitAssessment();
                    }
                }, 200);
            }
        });
        
        answerOptionsEl.appendChild(optionEl);
    });
    
    // Show/hide double-click hint
    updateDoubleClickHint();
    
    // Update navigation buttons
    updateNavigation();
    updateProgress();
}

/**
 * Select Answer
 * Stores user's answer and updates UI
 * @param {string} questionId - The question ID
 * @param {number} value - The maturity level value (1-4)
 */
function selectAnswer(questionId, value) {
    const currentAnswers = getAnswersArray(questionId);

    // Toggle selection
    const index = currentAnswers.indexOf(value);
    if (index >= 0) {
        currentAnswers.splice(index, 1);
    } else {
        currentAnswers.push(value);
    }
    
    // Update UI to show selected answer and ARIA states
    const options = document.querySelectorAll('.answer-option');
    options.forEach(option => {
        const optionValue = parseInt(option.dataset.value);
        if (currentAnswers.includes(optionValue)) {
            option.classList.add('answer-option--selected');
            option.setAttribute('aria-pressed', 'true');
        } else {
            option.classList.remove('answer-option--selected');
            option.setAttribute('aria-pressed', 'false');
        }
    });
    
    // Save progress to localStorage
    saveProgress();
    
    updateNavigation();
}

/**
 * Detect if user is on mobile device
 */
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
        || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
}

/**
 * Update Double-click Hint Visibility
 * Shows hint on first 3 questions with platform-appropriate text
 */
function updateDoubleClickHint() {
    const hintEl = document.getElementById('double-click-hint');
    const hintTextEl = document.getElementById('double-click-hint-text');
    
    // Update text based on platform and question number
    const isMobile = isMobileDevice();
    
    // Show enhanced guidance on first question only
    if (state.currentQuestionIndex === 0) {
        hintTextEl.textContent = 'You can select multiple answers that match your experience. Consider both 👤 personal and 💼 professional AI use.';
    } else {
        hintTextEl.textContent = isMobile
            ? 'Select one or more options. Tap Next when you\'re ready.'
            : 'Select one or more options. Click Next when you\'re ready.';
    }
    
    // Show hint only on first 3 questions (index 0, 1, 2)
    if (state.currentQuestionIndex >= 3) {
        hintEl.classList.add('double-click-hint--hidden');
    } else {
        hintEl.classList.remove('double-click-hint--hidden');
    }
}

/**
 * Update Navigation Buttons
 * Enables/disables buttons based on current state
 */
function updateNavigation() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    const currentQuestion = state.questions[state.currentQuestionIndex];
    
    // Previous button
    prevBtn.disabled = state.currentQuestionIndex === 0;
    
    // Next/Submit button (allow proceeding if at least one option selected)
    const currentAnswers = getAnswersArray(currentQuestion.id);
    const hasAnswer = currentAnswers.length > 0;
    
    if (state.currentQuestionIndex === state.questions.length - 1) {
        // Last question - show submit button
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-block';
        submitBtn.disabled = !hasAnswer;
    } else {
        // Not last question - show next button
        nextBtn.style.display = 'inline-block';
        submitBtn.style.display = 'none';
        nextBtn.disabled = !hasAnswer;
    }
}

/**
 * Update Progress Indicator
 * Updates progress bar and question counter based on current section
 */
function updateProgress() {
    const currentSection = state.sections[state.currentSection];
    const sectionQuestions = currentSection.questions;
    const questionIndexInSection = sectionQuestions.findIndex(q => q.id === state.questions[state.currentQuestionIndex].id);
    
    // Calculate progress within current section
    // Progress fills up as you answer questions, not just view them
    const currentQuestion = state.questions[state.currentQuestionIndex];
    const currentAnswers = getAnswersArray(currentQuestion.id);
    const hasAnswer = currentAnswers.length > 0;
    const completedQuestions = questionIndexInSection + (hasAnswer ? 1 : 0);
    const progress = (completedQuestions / sectionQuestions.length) * 100;
    
    const progressFillEl = document.getElementById('progress-fill');
    progressFillEl.style.width = `${progress}%`;
    
    // Update ARIA progressbar value
    const progressBarEl = document.querySelector('.progress__bar');
    if (progressBarEl) {
        progressBarEl.setAttribute('aria-valuenow', Math.round(progress));
    }
    
    // Update section title and question counter
    document.getElementById('section-title').textContent = `Section ${state.currentSection + 1}: ${currentSection.name}`;
    document.getElementById('current-question').textContent = questionIndexInSection + 1;
    document.getElementById('section-total').textContent = sectionQuestions.length;
    
    // Update overall progress circles
    const circles = document.querySelectorAll('.progress__circle');
    if (circles.length > 0) {
        circles.forEach((circle, index) => {
            // Remove all state classes
            circle.classList.remove('progress__circle--completed', 'progress__circle--current');
            
            // Get answers for this question
            const question = state.questions[index];
            const answers = question ? getAnswersArray(question.id) : [];
            const hasAnswer = answers.length > 0;
            
            if (index < state.currentQuestionIndex || (index === state.currentQuestionIndex && hasAnswer)) {
                // Completed questions
                circle.classList.add('progress__circle--completed');
            } else if (index === state.currentQuestionIndex) {
                // Current question
                circle.classList.add('progress__circle--current');
            }
        });
        
        // Update ARIA attribute
        const circlesContainer = document.getElementById('progress-circles');
        if (circlesContainer) {
            const completedCount = state.questions.filter((q, idx) => {
                if (idx < state.currentQuestionIndex) return true;
                if (idx === state.currentQuestionIndex) {
                    const answers = getAnswersArray(q.id);
                    return answers.length > 0;
                }
                return false;
            }).length;
            circlesContainer.setAttribute('aria-valuenow', completedCount);
        }
    }
}

/**
 * Next Question
 * Advances to the next question in the assessment
 * Handles section transitions with visual feedback
 */
function nextQuestion() {
    // Validate that at least one answer is selected
    const currentQuestion = state.questions[state.currentQuestionIndex];
    const currentAnswers = getAnswersArray(currentQuestion.id);
    
    if (currentAnswers.length === 0) {
        // Show error message
        alert('Please select at least one answer before continuing.');
        return;
    }
    
    if (state.currentQuestionIndex < state.questions.length - 1) {
        // Clear focus from any active element (prevents mobile tap highlight persistence)
        if (document.activeElement) {
            document.activeElement.blur();
        }
        
        const nextQuestionData = state.questions[state.currentQuestionIndex + 1];
        
        // Check if we're moving to a new section
        const isNewSection = currentQuestion.category !== nextQuestionData.category;
        
        // Check if moving to new section
        if (isNewSection) {
            // Update currentSection based on the next question's category
            state.currentQuestionIndex++;
            const nextQuestion = state.questions[state.currentQuestionIndex];
            state.currentSection = state.sections.findIndex(s => s.name === nextQuestion.category);
            showSectionIntroScreen(state.currentSection);
        } else {
            // Normal question transition
            const container = document.querySelector('.question-container');
            if (container) {
                container.classList.add('transitioning-out');
                
                setTimeout(() => {
                    state.currentQuestionIndex++;
                    renderQuestion();
                    
                    // Remove out class and add in class
                    container.classList.remove('transitioning-out');
                    container.classList.add('transitioning-in');
                    
                    // Clean up animation class after animation completes
                    setTimeout(() => {
                        container.classList.remove('transitioning-in');
                    }, 300);
                }, 300);
            }
        }
    }
}

/**
 * Previous Question
 * Returns to the previous question
 * Handles section transitions when going backwards
 */
function prevQuestion() {
    if (state.currentQuestionIndex > 0) {
        const currentQuestion = state.questions[state.currentQuestionIndex];
        const prevQuestionData = state.questions[state.currentQuestionIndex - 1];
        
        // Add transition class
        const container = document.querySelector('.question-container');
        if (container) {
            container.classList.add('transitioning-out');
            
            setTimeout(() => {
                // Update index first
                state.currentQuestionIndex--;
                
                // Update currentSection based on the question we're moving to
                const prevQuestion = state.questions[state.currentQuestionIndex];
                state.currentSection = state.sections.findIndex(s => s.name === prevQuestion.category);
                
                renderQuestion();
                
                // Remove out class and add in class
                container.classList.remove('transitioning-out');
                container.classList.add('transitioning-in');
                
                // Clean up animation class after animation completes
                setTimeout(() => {
                    container.classList.remove('transitioning-in');
                }, 300);
            }, 300);
        }
    }
}

/**
 * Calculate Scores
 * Computes overall and category-specific maturity scores
 * @returns {Object} Scores object with overall and category breakdowns
 */
function calculateScores() {
    const categoryScores = {};
    const categoryCounts = {};
    const categoryAverages = {};
    const questionNuance = {}; // Track multi-select nuance per question
    const categoryNuance = {}; // Track contextual complexity per category
    
    // Initialize category data
    state.categories.forEach(category => {
        categoryScores[category.name] = 0;
        categoryCounts[category.name] = 0;
        categoryNuance[category.name] = { multiSelectCount: 0, totalQuestions: 0, avgSpread: 0 };
    });
    
    // Calculate scores per category (handle multi-select by taking maximum value)
    state.questions.forEach(question => {
        const answers = normalizeAnswerValue(state.answers[question.id]);
        if (answers.length > 0) {
            // Use maximum value - represents peak capability
            const maxAnswer = Math.max(...answers);
            categoryScores[question.category] += maxAnswer;
            categoryCounts[question.category] += 1;
            
            // Track nuance: multiple selections indicate contextual judgment
            const spread = answers.length > 1 ? Math.max(...answers) - Math.min(...answers) : 0;
            questionNuance[question.id] = {
                count: answers.length,
                values: answers,
                spread: spread,
                isContextual: answers.length > 1 // User varies approach by situation
            };
            
            // Aggregate category-level nuance
            categoryNuance[question.category].totalQuestions += 1;
            if (answers.length > 1) {
                categoryNuance[question.category].multiSelectCount += 1;
                categoryNuance[question.category].avgSpread += spread;
            }
        }
    });
    
    // Calculate averages (maturity level average)
    Object.keys(categoryScores).forEach(category => {
        if (categoryCounts[category] > 0) {
            categoryAverages[category] = categoryScores[category] / categoryCounts[category];
            
            // Finalize category nuance metrics
            if (categoryNuance[category].multiSelectCount > 0) {
                categoryNuance[category].avgSpread /= categoryNuance[category].multiSelectCount;
                categoryNuance[category].contextualPercentage = 
                    (categoryNuance[category].multiSelectCount / categoryNuance[category].totalQuestions) * 100;
            }
        } else {
            categoryAverages[category] = 0;
        }
    });
    
    // Calculate overall score (average of all category averages)
    const overallAverage = Object.values(categoryAverages).reduce((a, b) => a + b, 0) / Object.keys(categoryAverages).length;
    
    // Check if any category has "Not Started" (score < 1.5)
    const hasNotStarted = Object.values(categoryAverages).some(avg => avg < 1.5);
    
    // Determine maturity level for overall score
    // CRITICAL: If any category is "Not Started", cap overall at "Not Started"
    let overallMaturity;
    if (hasNotStarted) {
        overallMaturity = 'Not Started';
    } else {
        overallMaturity = getMaturityLevel(overallAverage);
    }
    
    return {
        overall: overallAverage,
        overallMaturity: overallMaturity,
        hasNotStarted: hasNotStarted,
        categories: categoryAverages,
        categoryMaturities: Object.fromEntries(
            Object.entries(categoryAverages).map(([cat, avg]) => [cat, getMaturityLevel(avg)])
        ),
        questionNuance: questionNuance,
        categoryNuance: categoryNuance
    };
}

/**
 * Get Maturity Level from average score
 * Maps numeric score to maturity level label
 * @param {number} score - Average score (1-4)
 * @returns {string} Maturity level label
 */
function getMaturityLevel(score) {
    if (score < 1.5) return 'Not Started';
    if (score < 2.5) return 'Compliant';
    if (score < 3.5) return 'Competent';
    return 'Creative';
}

/**
 * Generate Recommendations
 * Creates personalized, actionable recommendations based on scores
 * References: Anthropic 4D AI Fluency Framework, Allie K Miller's AI leadership principles
 * @param {Object} scores - Calculated scores object
 * @returns {Array} Array of recommendation objects
 */
function generateRecommendations(scores) {
    const recommendations = [];
    
    // Delegation recommendations
    const delegationScore = scores.categories['Delegation'];
    if (delegationScore < 2) {
        recommendations.push({
            category: 'Delegation',
            maturity: scores.categoryMaturities['Delegation'],
            text: 'Start by identifying 2-3 repetitive tasks you can delegate to AI this week. Practice writing clear, context-rich prompts that include: the problem, desired outcome, constraints, and success criteria. Experiment with tools like ChatGPT or Claude for drafting, research, or analysis tasks.'
        });
    } else if (delegationScore < 3) {
        recommendations.push({
            category: 'Delegation',
            maturity: scores.categoryMaturities['Delegation'],
            text: 'Level up by creating a "delegation playbook" for your team. Document which tasks are best suited for AI vs. human expertise. Practice breaking complex projects into discrete, AI-delegable components. Focus on providing rich context and clear success metrics in your prompts.'
        });
    } else if (delegationScore < 3.5) {
        recommendations.push({
            category: 'Delegation',
            maturity: scores.categoryMaturities['Delegation'],
            text: 'You\'re ready to architect AI-human workflows. Design systems where AI handles parallel workstreams while you focus on strategic oversight. Experiment with multi-step AI processes and teach your team to identify high-value delegation opportunities. Consider creating templates for common delegation patterns. **For advanced coding projects:** All Twilio employees have access to GitHub Copilot (instructions available in Switchboard). This tool is excellent for those comfortable with AI basics who want to explore "vibe coding" solutions, like creating web apps that run locally on your computer.'
        });
    } else {
        recommendations.push({
            category: 'Delegation',
            maturity: scores.categoryMaturities['Delegation'],
            text: 'You\'re operating at an expert level. Share your delegation frameworks with the organization. Mentor others on sophisticated AI delegation strategies. Push boundaries by exploring emerging AI capabilities and creating innovative workflows that weren\'t previously possible. **Pro tip:** If you haven\'t already, explore GitHub Copilot (available to all Twilio employees via Switchboard) for advanced coding and rapid prototyping of local web applications.'
        });
    }
    
    // Communication recommendations
    const communicationScore = scores.categories['Communication'];
    if (communicationScore < 2) {
        recommendations.push({
            category: 'Communication',
            maturity: scores.categoryMaturities['Communication'],
            text: 'Practice the "5 W\'s" framework when working with AI: Who (audience), What (deliverable), When (timeline), Where (context), Why (purpose). Start documenting your processes in simple, step-by-step language. This clarity will improve both AI interactions and team communication.'
        });
    } else if (communicationScore < 3) {
        recommendations.push({
            category: 'Communication',
            maturity: scores.categoryMaturities['Communication'],
            text: 'Develop your "prompt engineering" skills by creating reusable templates for common tasks. Practice articulating not just what you want, but why it matters and how it fits into the bigger picture. Build a library of effective prompts and share them with your team.'
        });
    } else if (communicationScore < 3.5) {
        recommendations.push({
            category: 'Communication',
            maturity: scores.categoryMaturities['Communication'],
            text: 'You excel at clear communication. Now focus on teaching others. Create communication frameworks for your team that work for both AI and human collaboration. Document your process for translating business objectives into actionable, specific requirements.'
        });
    } else {
        recommendations.push({
            category: 'Communication',
            maturity: scores.categoryMaturities['Communication'],
            text: 'Your communication skills are exceptional. Share your knowledge in workshops on effective AI communication. Create organizational standards for prompt engineering and process documentation. Help others develop the clarity that makes AI collaboration successful.'
        });
    }
    
    // Discernment recommendations
    const discernmentScore = scores.categories['Discernment'];
    if (discernmentScore < 2) {
        recommendations.push({
            category: 'Discernment',
            maturity: scores.categoryMaturities['Discernment'],
            text: 'Build your "AI quality checklist": Does the output answer the question? Is it factually accurate? Does it align with your standards? Always verify AI outputs against your domain expertise. Treat AI as a first draft that requires your expert review and refinement.'
        });
    } else if (discernmentScore < 3) {
        recommendations.push({
            category: 'Discernment',
            maturity: scores.categoryMaturities['Discernment'],
            text: 'Develop your critical evaluation skills by actively looking for gaps, biases, and logical flaws in AI outputs. Create rubrics for "good vs. great" work in your domain. Practice giving specific, actionable feedback to improve AI-generated content. Stay current with industry best practices.'
        });
    } else if (discernmentScore < 3.5) {
        recommendations.push({
            category: 'Discernment',
            maturity: scores.categoryMaturities['Discernment'],
            text: 'You have strong discernment skills. Use them to coach others on quality evaluation. Create frameworks for assessing AI outputs in your domain. Help your team develop the critical thinking skills needed to separate signal from noise and identify when AI is hallucinating or missing context.'
        });
    } else {
        recommendations.push({
            category: 'Discernment',
            maturity: scores.categoryMaturities['Discernment'],
            text: 'Your discernment is exceptional. Help the organization establish quality standards for AI-assisted work. Create training materials on critical evaluation. Push the boundaries by identifying novel applications where your expert judgment can unlock new AI capabilities.'
        });
    }
    
    // Keeping It Twilio recommendations
    const twilioScore = scores.categories['Keeping It Twilio'];
    if (twilioScore < 2) {
        recommendations.push({
            category: 'Keeping It Twilio',
            maturity: scores.categoryMaturities['Keeping It Twilio'],
            text: 'Start by reviewing Twilio\'s AI usage policies and data protection guidelines. Never share customer data, proprietary code, or confidential information with AI tools. Use only approved platforms. When in doubt, ask your security team. Build the habit of thinking "Is this safe to share?" before every AI interaction.'
        });
    } else if (twilioScore < 3) {
        recommendations.push({
            category: 'Keeping It Twilio',
            maturity: scores.categoryMaturities['Keeping It Twilio'],
            text: 'Set up a "human-in-the-loop" practice for your team. Make sure someone always reviews AI outputs before they go to customers or stakeholders. Create guidelines for your team on responsible AI use. Actively look for potential biases in AI outputs and challenge assumptions.'
        });
    } else if (twilioScore < 3.5) {
        recommendations.push({
            category: 'Keeping It Twilio',
            maturity: scores.categoryMaturities['Keeping It Twilio'],
            text: 'You\'re modeling responsible AI use. Create a culture where AI errors are learning opportunities, not failures. Develop team practices that embed Twilio values into AI workflows. Share your approach to ethical AI use with other teams. Help others navigate the balance between innovation and responsibility.'
        });
    } else {
        recommendations.push({
            category: 'Keeping It Twilio',
            maturity: scores.categoryMaturities['Keeping It Twilio'],
            text: 'You\'re a champion of responsible AI use. Help spread ethical AI practices across your team and the organization. Create frameworks that help others align AI use with Twilio values. Use AI strategically to amplify what makes Twilio unique. Set the standard for how AI can enhance, not replace, human judgment and Twilio\'s culture.'
        });
    }
    
    // Add Global Github Copilot recommendation for high performers (Competent+ in most categories)
    // Check if average score is >= 3.0 (Competent) or if at least 3 categories are >= 3.0
    const competentCategories = Object.values(scores.categories).filter(s => s >= 2.5).length;
    const isHighPerformer = scores.overall >= 2.5 || competentCategories >= 3;
    
    if (isHighPerformer) {
        recommendations.push({
            category: 'Pro Tip',
            maturity: 'All',
            text: '<strong>Ready for the next level?</strong> Since you\'re demonstrating strong AI competence, checked out GitHub Copilot yet? It\'s available to <strong>ALL Twilio employees</strong> (not just engineers!). Instructions for access are in Switchboard. It\'s a powerful tool for "vibe coding" — building small personal web apps, automating scripts, or just exploring code concepts even if you\'re not a developer.'
        });
    }
    
    return recommendations;
}

/**
 * Convert Markdown to HTML
 * Handles basic markdown formatting for recommendations
 */
function markdownToHtml(text) {
    let html = text;
    
    // Convert code blocks first (```language\ncode\n``` or ```\ncode\n```)
    html = html.replace(/```[\w]*\s*\n([\s\S]*?)\n```/g, '<pre><code>$1</code></pre>');
    
    // Convert headers (#### -> h4, ### -> h3, ## -> h2, # -> h1)
    // Process from most specific (####) to least specific (#) to avoid conflicts
    html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
    
    // Convert **bold** to <strong>
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Process bullet lists - handle main bullets and sub-items
    // First, identify list blocks (consecutive lines starting with -)
    const lines = html.split('\n');
    let inList = false;
    let processedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        
        // Check if this is a bullet item
        if (trimmed.match(/^[\-\*]\s+/)) {
            if (!inList) {
                processedLines.push('<ul>');
                inList = true;
            }
            // Remove the bullet marker and wrap in <li>
            const content = trimmed.replace(/^[\-\*]\s+/, '');
            processedLines.push(`<li>${content}</li>`);
        } else if (inList && trimmed === '') {
            // Empty line ends the list
            processedLines.push('</ul>');
            inList = false;
            processedLines.push(line);
        } else {
            if (inList && trimmed !== '') {
                // Non-bullet line inside list context - close the list
                processedLines.push('</ul>');
                inList = false;
            }
            processedLines.push(line);
        }
    }
    
    // Close list if still open
    if (inList) {
        processedLines.push('</ul>');
    }
    
    html = processedLines.join('\n');
    
    // Convert paragraph blocks (text separated by blank lines)
    html = html.split('\n\n').map(block => {
        const trimmed = block.trim();
        if (trimmed && !trimmed.includes('<ul>') && !trimmed.includes('<li>') && 
            !trimmed.includes('<h') && !trimmed.includes('<pre>') && 
            !trimmed.startsWith('<')) {
            return `<p>${trimmed}</p>`;
        }
        return block;
    }).join('\n\n');
    
    // Clean up extra newlines but preserve structure
    html = html.replace(/\n{3,}/g, '\n\n');
    html = html.replace(/\n/g, ' ');
    html = html.replace(/<\/li>\s+<li>/g, '</li><li>');
    html = html.replace(/<\/ul>\s+<ul>/g, '</ul><ul>');
    html = html.replace(/<\/(h[123]|p|ul|pre)>\s+<(h[123]|p|ul|pre)/g, '</$1><$2');
    
    return html;
}

/**
 * Generate Single AI Recommendation
 * Generates one recommendation for a specific category
 */
async function generateSingleRecommendation(category, scores) {
    console.log(`[AI Rec] generateSingleRecommendation called for: ${category}`);
    
    // Check if CONFIG exists and Windmill is configured
    if (typeof CONFIG === 'undefined' || !CONFIG.USE_AI_RECOMMENDATIONS || CONFIG.WINDMILL_ENDPOINT === 'YOUR_WINDMILL_WEBHOOK_URL_HERE') {
        console.log(`[AI Rec] ⚠️ CONFIG not available or AI disabled for ${category}`);
        const staticRecs = generateRecommendations(scores);
        return staticRecs.find(r => r.category === category);
    }
    
    const { jobTitle, team, jobLevel } = state.userContext;
    const { subDepartment, aiFrequency, aiToolsUsed, workFocus } = state.userContext;
    
    // Determine seniority tier and career track for richer personalization
    const levelPrefix = jobLevel.charAt(0); // S, P, M, or E
    const levelNum = parseInt(jobLevel.substring(1));
    const trackNames = { 'S': 'Specialist (Individual Contributor)', 'P': 'Professional (Individual Contributor)', 'M': 'Management', 'E': 'Executive' };
    const trackName = trackNames[levelPrefix] || 'Unknown';
    let seniorityTier;
    if (levelPrefix === 'E' || (levelPrefix === 'M' && levelNum >= 5)) {
        seniorityTier = 'Senior Leadership';
    } else if (levelPrefix === 'M' || levelNum >= 4) {
        seniorityTier = 'Senior / Leadership';
    } else if (levelNum >= 3) {
        seniorityTier = 'Mid-Level';
    } else {
        seniorityTier = 'Early Career';
    }
    const canProcure = levelPrefix === 'M' || levelPrefix === 'E' || levelNum >= 4;
    const managesOthers = levelPrefix === 'M' || levelPrefix === 'E';
    
    // Map AI frequency to human-readable experience level
    const frequencyDescriptions = {
        'never': 'Has never used AI tools — complete beginner. Recommendations should start from absolute zero with no assumed knowledge.',
        'rarely': 'Has tried AI tools a few times but no regular habit. Knows the basics but needs guidance building consistency.',
        'monthly': 'Uses AI tools a few times a month — familiar but not fluent. Ready for deeper techniques and workflow integration.',
        'weekly': 'Regular AI user (weekly). Has working knowledge — push toward advanced techniques, efficiency gains, and repeatable workflows.',
        'daily': 'Daily AI user — AI is already part of their workflow. Do NOT teach basics. Focus on optimization, scaling practices, and pushing boundaries.'
    };
    const aiExperienceDescription = frequencyDescriptions[aiFrequency] || 'Unknown AI experience level';
    
    // Build tools context
    const hasNone = aiToolsUsed.includes('None');
    const knownPlatformTools = ['Gemini', 'NotebookLM', 'ChatGPT', 'GitHub Copilot', 'Claude Code', 'ZoomAI', 'LoomAI'];
    let toolsContext;
    if (hasNone || aiToolsUsed.length === 0) {
        toolsContext = 'Has not used any AI tools yet. Introduce tools gently — recommend starting with ONE tool (Gemini) rather than overwhelming with multiple.';
    } else {
        const platformTools = aiToolsUsed.filter(t => knownPlatformTools.includes(t));
        const customTools = aiToolsUsed.filter(t => !knownPlatformTools.includes(t) && t !== 'None');
        let toolsList = platformTools.join(', ');
        if (customTools.length > 0) {
            toolsList += (toolsList ? ', ' : '') + customTools.join(', ') + ' (user-specified tools — provide tips for these if you can identify what they are)';
        }
        toolsContext = `Already uses: ${toolsList}. For tools they already know, suggest ADVANCED features or new use patterns. For tools they HAVEN'T tried, introduce them. For any user-specified tools you recognize, provide a relevant tip.`;
    }
    
    let prompt = `Generate ONE detailed, deeply personalized recommendation for this specific Twilio employee.\n\n`;
    prompt += `**EMPLOYEE PROFILE — USE THIS TO PERSONALIZE EVERY ASPECT OF YOUR RESPONSE:**\n`;
    prompt += `- Job Title: ${jobTitle}\n`;
    prompt += `- Team / Department: ${team}${subDepartment ? ' → ' + subDepartment : ''}\n`;
    prompt += `- Job Level: ${jobLevel} (${trackName} track)\n`;
    prompt += `- Seniority: ${seniorityTier}\n`;
    prompt += `- Level Expectations: ${getJobLevelDescription(jobLevel)}\n`;
    prompt += `- Can procure tools: ${canProcure ? 'Yes' : 'No — direct to Switchboard for approved tools'}\n`;
    prompt += `- Manages others: ${managesOthers ? 'Yes — consider how they can model AI use and enable their teams' : 'No — focus on personal productivity and craft excellence'}\n`;
    prompt += `- AI Experience: ${aiExperienceDescription}\n`;
    prompt += `- AI Tools Already Used: ${toolsContext}\n`;
    if (workFocus) {
        prompt += `- Primary Work Focus: "${workFocus}" — THIS IS THE MOST IMPORTANT PERSONALIZATION SIGNAL. Ground ALL examples and deliverables in this specific work, not generic department tasks.\n`;
    }
    prompt += `\n`;
    prompt += `**HOW TO USE THIS PROFILE:**\n`;
    prompt += `- Frame ALL examples around what a ${jobTitle} in ${team}${subDepartment ? ' (' + subDepartment + ')' : ''} would actually work on day-to-day\n`;
    prompt += `- ${workFocus ? 'Their PRIMARY work is: "' + workFocus + '" — make this the backbone of every example and Quick Win' : 'No specific work focus provided — use their job title and department to infer realistic deliverables'}\n`;
    prompt += `- Calibrate to their AI experience level: ${aiFrequency === 'never' || aiFrequency === 'rarely' ? 'they are NEW to AI — be concrete and encouraging, assume nothing' : aiFrequency === 'daily' ? 'they are a POWER USER — skip basics entirely, push for advanced techniques and systematization' : 'they have moderate AI experience — balance practical tips with deeper techniques'}\n`;
    prompt += `- Calibrate ambition to their seniority: ${seniorityTier === 'Early Career' ? 'focus on building foundational habits and learning from examples' : seniorityTier === 'Mid-Level' ? 'focus on deepening skills, building repeatable workflows, and sharing knowledge with peers' : 'focus on strategic leverage, scaling AI practices across teams, and setting standards for others'}\n`;
    prompt += `- Use language appropriate to their level: ${levelPrefix === 'E' || (levelPrefix === 'M' && levelNum >= 5) ? 'strategic, outcome-oriented, focused on organizational impact' : levelPrefix === 'M' ? 'team-oriented, focused on enabling others and improving team workflows' : 'hands-on, practical, focused on personal craft and immediate productivity gains'}\n`;
    prompt += `- In Tips for Using AI Tools: Follow the TOOL SELECTION DECISION TREE in your system prompt. The employee's team is "${team}"${subDepartment ? ' (' + subDepartment + ')' : ''} — only recommend role-specific tools if their team qualifies.\n`;
    prompt += `- If they already use certain tools (see above), suggest advanced features of those tools, not basic introductions.\n`;
    prompt += `- Quick Wins should be things a ${jobTitle} would realistically do THIS WEEK in their actual work\n\n`;
    
    // Add special context if any category is Not Started
    if (scores.hasNotStarted) {
        const notStartedCategories = Object.entries(scores.categoryMaturities)
            .filter(([cat, maturity]) => maturity === 'Not Started')
            .map(([cat]) => cat);
        
        prompt += `**IMPORTANT CONTEXT:**\n`;
        prompt += `This user has "Not Started" in ${notStartedCategories.length > 1 ? 'multiple categories' : 'at least one category'} (${notStartedCategories.join(', ')}), which means their overall score is capped at "Not Started" regardless of their other scores. `;
        prompt += `This is because all four dimensions are essential - excelling in some areas doesn't compensate for not having started in others.\n\n`;
        prompt += `**YOUR TONE:**\n`;
        prompt += `- Be encouraging and constructive, not alarming or judgmental\n`;
        prompt += `- Frame this as a learning opportunity and a clear starting point\n`;
        prompt += `- Acknowledge that everyone starts somewhere, and "Not Started" simply means there's room to grow\n`;
        prompt += `- Briefly mention that getting started in ALL dimensions is important for AI readiness\n`;
        prompt += `- Focus on actionable first steps rather than dwelling on the gap\n\n`;
    }
    
    prompt += `**Category to focus on: ${category}**\n\n`;
    prompt += `**Their Overall Score:**\n`;
    const score = scores.categories[category];
    const maturity = scores.categoryMaturities[category];
    prompt += `- ${category}: ${maturity} (${score.toFixed(2)}/4.00)\n\n`;
    
    // Add contextual nuance summary
    const categoryNuanceData = scores.categoryNuance[category];
    if (categoryNuanceData && categoryNuanceData.multiSelectCount > 0) {
        prompt += `**CONTEXTUAL AWARENESS:**\n`;
        prompt += `This user selected multiple options on ${categoryNuanceData.multiSelectCount} out of ${categoryNuanceData.totalQuestions} questions in ${category}. `;
        prompt += `This indicates they vary their approach based on context - a sign of sophisticated judgment. `;
        prompt += `DO NOT push them toward "always use the most advanced approach." Instead, help them expand their toolkit while honoring that different situations call for different levels of AI use.\n\n`;
    }
    
    // Add specific question responses for this category
    prompt += `**THEIR ACTUAL RESPONSES in ${category} - USE THESE TO GROUND YOUR FEEDBACK:**\n`;
    const categoryQuestions = state.questions.filter(q => q.category === category);
    console.log(`[AI Rec] Found ${categoryQuestions.length} questions for ${category}:`, categoryQuestions.map(q => q.id));
    let hasResponses = false;
    
    categoryQuestions.forEach(question => {
        // Read answers from scores.questionNuance (frozen at score-calculation time)
        // instead of state.answers, which may be cleared by clearProgress() during async generation
        const nuanceData = scores.questionNuance[question.id];
        const answers = nuanceData ? nuanceData.values : [];
        console.log(`[AI Rec] ${question.id} (${category}): nuance=${JSON.stringify(nuanceData ? nuanceData.values : 'none')}, answers=${JSON.stringify(answers)}`);
        if (answers.length === 0) return;
        
        // Extract the question subcategory (before the colon)
        const colonIndex = question.text.indexOf(':');
        const subcategory = colonIndex !== -1 ? question.text.substring(0, colonIndex).trim() : question.text;

        prompt += `\n**${subcategory}:**\n`;

        // Include each selected behavior (multi-select)
        // Use loose equality (==) to handle potential string/number mismatches in answer values
        const selectedOptions = answers
            .map((value) => ({ value, option: question.options.find(opt => opt.value == value) }))
            .filter((x) => Boolean(x.option));

        if (selectedOptions.length === 0) return;

        // Mark as having valid responses only if we actually found matching options
        hasResponses = true; 
        
        const nuanceInfo = scores.questionNuance[question.id];
        if (nuanceInfo && nuanceInfo.isContextual) {
            prompt += `Selected (${selectedOptions.length}) - CONTEXTUAL: they vary their approach:\n`;
        } else {
            prompt += `Selected (${selectedOptions.length}):\n`;
        }
        selectedOptions.forEach(({ value, option }) => {
            prompt += `- ${option.label} (${value}/4): "${option.description}"\n`;
        });
    });
    
    // Fallback if no responses found for this category
    if (!hasResponses) {
        console.warn(`[AI Rec] ⚠️ hasResponses=false for ${category} — all ${categoryQuestions.length} questions had no matching options. Using static fallback.`);
        console.warn(`[AI Rec] state.answers keys:`, Object.keys(state.answers));
        const staticRecs = generateRecommendations(scores);
        return staticRecs.find(r => r.category === category);
    }
    
    console.log(`[AI Rec] hasResponses=true for ${category}, proceeding to API call...`);
    
    prompt += `\n\n**CRITICAL INSTRUCTIONS:**\n`;
    prompt += `1. DIRECTLY REFERENCE their actual selected behaviors above - don't be generic\n`;
    prompt += `2. If they scored 1-2 on something, call out THAT SPECIFIC behavior they described and how to improve it\n`;
    prompt += `3. If they scored 3-4 on something, weave acknowledgment INTO your advice — never as a standalone warm-up paragraph. Maximum ONE sentence.\n`;
    prompt += `4. Make it feel like you read their actual responses, not a template\n`;
    prompt += `5. Be specific about which behaviors to START, STOP, or CONTINUE based on what they selected\n`;
    prompt += `6. **RIGHT-SIZED AI USE**: If they showed contextual judgment (multiple selections), recognize this as sophisticated. Frame recommendations as "expand your toolkit" not "always do X." Emphasize matching AI intensity to task complexity.\n`;
    prompt += `7. **AVOID ONE-SIZE-FITS-ALL**: Don't imply they should always use the most advanced approach. Help them recognize when to use different levels of AI engagement.\n`;
    prompt += `8. **NAME SPECIFIC DELIVERABLES**: Reference actual artifacts for their role — say "competitive battle card" not "marketing content", say "incident postmortem" not "documentation", say "QBR deck" not "customer presentation". Ground every example in what they literally produce.\n`;
    prompt += `9. **LEAD WITH INSIGHT, NOT VALIDATION**: Open every section with the actionable growth point. Do NOT open with "You're already doing great" or "It's clear that you...". Start with what to DO differently. Weave any strength acknowledgment into the advice itself.\n`;
    prompt += `10. **DENSITY OVER WARMTH**: Every sentence must either (a) identify a specific gap, (b) provide a concrete action, or (c) connect to a measurable outcome. Cut filler phrases. Be direct and useful.\n\n`;
    prompt += `Use markdown formatting with the structure from your system prompt.`;
    
    // System message for the AI coach
    const systemMessage = `You are an experienced AI literacy coach at Twilio helping employees improve their AI collaboration skills.

VOICE AND TONE — THIS IS CRITICAL:
You're writing for adult learners at a tech company. The moment your writing feels corporate, formal, or like a training manual, they disengage. Write like a smart, helpful colleague — not like a consultant or HR document.

**THE GOLDEN RULE**: If you wouldn't say it out loud to a coworker, don't write it.

**BANNED JARGON — never use these phrases:**
- "task decomposition" → say "breaking work into smaller pieces"
- "modular delegation technique" → say "splitting things up"
- "micro-components" → say "smaller parts" or "chunks"
- "comprehensive context" → say "enough background" or "the full picture"
- "rigorous review process" → say "careful review" or "double-checking"
- "implement" → say "try," "use," "start," or "do"
- "utilize" → say "use" (THIS ONE IS CRITICAL — never write "utilize")
- "leverage" → say "use" or just describe the action
- "establish" → say "create," "set up," or "start"
- "enhance" / "enhancing" → say "improve" or be specific about what gets better
- "optimize" → say "improve" or be specific
- "streamline" → say "simplify" or "speed up"
- "facilitate" → just say what happens
- "articulate" → say "explain" or "describe"
- "comprehensive" → say "complete" or "full" (never "comprehensive")
- "systematic" / "systematically" → say "consistent" or describe the actual system
- "methodology" → say "approach" or "method"
- "strategically" → usually delete this word entirely
- "proactively" → usually delete this word entirely
- "robust" → be specific about what makes it strong
- "framework" → say "approach," "system," or describe what it actually is
- "audit" (as a verb for reviewing) → say "review" or "check"
- "ensure" / "ensuring" → say "make sure" or just remove it
- "elevate" → say "improve" or just describe the outcome
- "holistic" → say "full" or "complete" or just describe what it covers
- "refined" / "refine" → say "improved" or "sharpen" or "tighten up"
- "significantly" → delete this word — it adds nothing
- "integrate" / "integrating" → say "combine" or "bring together" or "use alongside"
- "align" / "aligning" → say "match" or "fit" or describe what matches what

**HARD RULE — SELF-CHECK**: Before returning your response, scan it for EVERY word on this banned list. If ANY banned word appears, replace it. No exceptions. The user's audience will mentally check out the moment they see corporate language.

**INSTEAD OF FORMAL, WRITE CONVERSATIONAL:**
❌ "Your current approach to task decomposition shows a sophisticated understanding of varying AI engagement levels."
✅ "You're already good at breaking work into pieces for AI — now let's make that even more effective."

❌ "Implement a rigorous review process by establishing a checklist for evaluating each piece against your campaign's strategic goals."
✅ "Create a quick checklist to review AI outputs before you use them — does it match your campaign goals? Does it sound like Twilio?"

❌ "Enhance this by consistently framing your AI prompts with detailed background information."
✅ "Give AI more context upfront — who's the audience? What's the goal? The more it knows, the better it writes."

❌ "This will ensure consistent compliance across your GTM campaigns."
✅ "This keeps your campaigns on track and avoids surprises."

**TONE GUIDELINES:**
- Write in second person ("you") — this is advice for THEM
- Use contractions ("you're," "don't," "it's") — they sound human
- Keep sentences short. Mix in some fragments. Like this.
- Be direct without being cold. Helpful without being sycophantic.
- It's okay to be a little casual, but stay professional. No slang, no emojis.
- Imagine you're giving advice to a smart colleague over coffee, not presenting at a corporate training.

**READ YOUR OUTPUT ALOUD**: If it sounds like a business document, rewrite it until it sounds like a person talking.

TWILIO CONTEXT - Available AI Tools:
- Google Gemini: Primary conversational AI tool. Features include multimodal input (text, images, PDFs), conversation history (kept for 60 days then deleted — save anything you want to keep), Gems (custom AI assistants you can create and share)
- NotebookLM: AI research assistant that grounds responses in uploaded documents. Great for analyzing multiple sources and creating study guides
- ZoomAI: Meeting assistant integrated into Zoom. Captures meeting summaries, action items, and key highlights. Only mention when relevant to meetings/collaboration
- LoomAI: Video message assistant. Auto-generates titles, chapters, summaries, and tasks from Loom videos. Only mention when relevant to async video communication
- OpenAI API: Available for developers (not the webapp) to build custom solutions
- Switchboard: Twilio's internal intranet - THE go-to resource for AI policies, privacy guidelines, approved tools, and best practices

LLM REALITIES — WEAVE THESE IN WHEN RELEVANT (not on every recommendation — only when your advice touches a risk area):
These are practical heads-ups, not scary disclaimers. Drop them in naturally like a colleague would.

**Hallucination risk** — When your advice involves using AI for fact-heavy, data-dependent, or research tasks:
- Work in a phrase like: "Double-check any numbers, dates, or citations AI gives you — it can sound confident and still be completely wrong."
- Especially flag this for: financial data, customer-facing content, legal/compliance, technical specs, competitive intel
- Tone: matter-of-fact, not alarming. It's just how LLMs work.

**Context window degradation** — When your advice involves long conversations, large documents, or multi-step workflows:
- Work in something like: "If your conversation gets really long, AI starts losing track of what you said earlier. Start a fresh chat when you switch topics, and re-paste the key context."
- Also relevant when recommending conversation history: "Gemini keeps your conversations for 60 days — after that they're gone. Save anything you want to keep."

**Lost-in-the-middle problem** — When your advice involves pasting large reference material, long briefs, or multi-source analysis:
- Work in something like: "Put the most important info at the top and bottom of your prompt — AI pays less attention to stuff buried in the middle of long inputs."
- Especially relevant for: document analysis, long prompts with multiple requirements, multi-source research

**IMPORTANT**: Don't add ALL of these to every recommendation. Only include the one(s) that genuinely apply to the specific advice you're giving. If none apply, skip this entirely. These should feel like natural tips woven into your advice, NOT a separate "warnings" section.

CRITICAL - Accuracy Requirements:
- ONLY recommend features that actually exist in these tools - do NOT invent capabilities
- If you're uncertain whether a feature exists, use general guidance instead of specific feature names
- Only mention ZoomAI/LoomAI when authentically relevant to the user's role (e.g., lots of meetings, video creation)
- If the employee CANNOT procure tools, direct them to Switchboard rather than suggesting new tools
- If the employee CAN procure tools, suggest evaluation criteria but avoid recommending specific external platforms

SWITCHBOARD REFERENCES:
- When discussing AI usage policies → "Check Switchboard for Twilio's AI usage guidelines"
- When discussing data privacy/security → "Visit Switchboard for data privacy and security policies"
- When discussing approved tools → "Explore Switchboard's AI Hub to discover approved tools"
- When discussing best practices → "Find best practices and templates on Switchboard"
- ALWAYS mention Switchboard when users need official policies, guidelines, or approved resources

TWILIO MAGIC VALUES - Integrate these into recommendations when relevant:

We are BUILDERS:
- Wear the Customers' Shoes: Stay obsessively customer focused, build with empathy and hospitality
- Draw the Owl: Embrace uncertainty, write the instruction book when there isn't one
- Write it Down: Blueprint plans with clear, concise writing to align others
- Organize into Small Teams: Stay connected to customers, clear on mission
- Learn Cheap Lessons: Design measurable experiments, test and iterate quickly

We are OWNERS:
- Trust is the #1 Thing We Sell: Earn trust through reliability and focusing on others' needs
- Think Long Term: Make decisions for best long-term outcomes, don't mortgage the future
- Have a Point of View: Know your business, develop recommendations, strong opinions loosely held
- Ruthlessly Prioritize: Focus on what matters most, be honest about constraints
- Be Frugal: Treat resources wisely, save where possible but never compromise quality
- Pick up the Trash: Sweat the details, help wherever you can
- Disagree and Commit: Debate openly, then commit fully to final decisions

We are CURIOUS:
- Be Humble: You don't have all the answers, everyone can teach you something
- Embrace the Uncomfortable: Growth happens outside comfort zones
- Seek the Truth: Find the best answer, not the loudest; learn from mistakes, don't blame
- Share Problems, Not Just Solutions: Invite others into problems to get best thinking
- Seek Progress Over Perfection: Iterate with testing and feedback over perfect designs

We are POSITRONS:
- Be Genuine: Be yourself, celebrate diverse perspectives
- No Shenanigans: Always be honest, direct, and transparent
- Empower Others: Invest in unleashing human potential in others
- Be Inclusive: Create environments where all are valued and can contribute fully
- Be Respectful: Listen well, being right isn't an excuse for being a jerk
- Ask How You Can Help: Proactively offer help to teammates

ASSESSMENT DIMENSIONS - Understand these precisely:
IMPORTANT: Each dimension focuses on DIFFERENT skills. Use DIFFERENT deliverable examples for each dimension to avoid repetition across tabs. The example deliverables below are suggestions — pick the ones most relevant to the employee's role.

1. DELEGATION (to AI systems):
   - How the user delegates tasks TO AI tools/LLMs (not to humans)
   - User's ability to break down problems and assign appropriate work to AI
   - Skill in determining what tasks AI can handle vs. what requires human judgment
   - Providing AI with clear scope, context, and boundaries for tasks
   - EXAMPLE DELIVERABLES for delegation advice: task breakdowns, project scoping docs, workflow designs, process maps, automation specifications, brief templates. Focus on how they STRUCTURE work before handing it to AI.
   
2. COMMUNICATION (with AI systems):
   - How the user communicates intent, quality expectations, and requirements TO AI systems
   - Crafting effective prompts that get high-quality outputs
   - Setting clear success criteria and constraints for AI-generated work
   - Iterating on prompts to refine AI understanding and outputs
   - EXAMPLE DELIVERABLES for communication advice: prompt templates, style guides, quality rubrics, specification documents, creative briefs. Focus on how they INSTRUCT AI and set expectations.
   
3. DISCERNMENT (of AI outputs):
   - User's ability to audit and evaluate AI-generated outputs
   - Providing high-quality feedback to AI tools/models/LLMs to improve results
   - Identifying hallucinations, errors, biases, or limitations in AI responses
   - Knowing when to trust AI output vs. when to verify or override
   - EXAMPLE DELIVERABLES for discernment advice: review checklists, validation frameworks, audit logs, feedback protocols, quality benchmarks. Focus on how they EVALUATE and REFINE AI output.
   
4. KEEPING IT TWILIO:
   - Risk management when using AI tools (data privacy, security, compliance)
   - Adhering to Twilio Magic Values while working with AI
   - Responsible AI use, bias awareness, and ethical considerations
   - Aligning AI usage with company policies and values
   - EXAMPLE DELIVERABLES for Keeping It Twilio advice: data handling protocols, team AI usage guidelines, compliance checklists, responsible use frameworks, values-aligned prompting guides. Focus on how they maintain SAFE and VALUES-ALIGNED AI use.

CRITICAL: Do NOT reuse the same deliverable examples across multiple dimensions. Each tab should feel like it addresses a genuinely different aspect of AI literacy.

ROLE-BASED PERSONALIZATION — CRITICAL:
Your recommendations MUST feel like they were written specifically for this person's role, not a generic employee. Follow these rules:

**By Career Track:**
- Specialist/Professional (S/P track): Focus on personal craft, hands-on techniques, and how AI amplifies their individual expertise. Examples should reference their specific domain work.
- Management (M track): Include BOTH personal AI use AND how to model/enable AI use for their teams. Mention how they can create team norms, share effective practices, and build psychological safety for AI experimentation.
- Executive (E track): Focus on strategic leverage — how AI can accelerate their decision-making, synthesize information across their org, and how they can champion AI adoption. Keep tactical advice minimal; emphasize impact.

**By Seniority Level:**
- Early Career (S1-S2, P1-P2): Be encouraging and ultra-specific. Give "do exactly this" instructions, not abstract principles. Example: "Open Gemini, paste your draft email, and ask: 'Make this more concise and direct while keeping the key ask in the first sentence.'" Frame AI as a learning accelerator. ONE technique per tip — don't overwhelm.
- Mid-Level (S3-S4, P3, M2-M3): They have domain expertise — show how AI amplifies it, don't teach them their job. Focus on building repeatable AI workflows they can reuse. Encourage them to document and share what works with peers. Push from occasional AI use toward systematic integration.
- Senior (P4-P5, M4-M5): ASSUME COMPETENCE. They know their domain — don't explain it to them. Push toward SYSTEMATIZING and SCALING AI practices. Focus on: creating reusable templates others adopt, establishing AI-augmented workflows for recurring high-stakes deliverables, and multiplying their impact through AI leverage. They should be building the playbook, not following one.
  **BANNED WORDS for Senior+**: NEVER use "consider", "ensure", "enhance", "try", "experiment with", "explore", "you might want to", "think about". These sound tentative and patronizing at this level.
  **REQUIRED VERBS for Senior+**: Use imperative, decisive language: "standardize", "establish", "build", "require", "mandate", "implement", "create", "define", "codify", "scale", "systematize".
- Leadership/Executive (P6-P7, M6, E7-E8): Skip warm-up framing entirely — go straight to strategic insight with organizational leverage. No hand-holding, no basic tips. Focus on: AI-augmented decision-making at scale, signaling AI adoption priorities to their org, and identifying where AI creates asymmetric advantage. Every recommendation should connect to org-level outcomes.
  **BANNED WORDS also apply to Leadership/Executive** — plus additionally ban: "you could", "it may be helpful", "one approach is". Use commanding voice: "Implement", "Mandate", "Signal", "Establish", "Require".

**By Department — reference SPECIFIC deliverables, not generic task types:**
- Engineering: Pull request descriptions, code review comments, incident postmortems, architecture decision records (ADRs), runbook documentation, API reference docs, sprint demo write-ups
- Product: PRDs, product one-pagers, user story acceptance criteria, competitive landscape briefs, sprint retro syntheses, feature prioritization frameworks, stakeholder update decks
- Sales: Discovery call prep sheets, mutual action plans, champion letters, deal risk assessments, account plans, proposal executive summaries, pipeline review narratives, win/loss analyses
- Customer Success: QBR decks, account health scorecards, renewal risk assessments, executive business reviews, onboarding playbooks, expansion opportunity briefs, customer communication cadences
- Support: Ticket response templates, knowledge base articles, escalation summaries, bug reproduction steps, trend analysis reports, customer-facing release notes, troubleshooting decision trees
- Marketing: Positioning docs, competitive battle cards, launch briefs, campaign post-mortems, messaging matrices, audience persona documents, content calendars, analyst briefing prep
- Operations: Process runbooks, workflow documentation, SOP updates, capacity planning models, vendor evaluation matrices, cross-functional project briefs, operational review decks
- Finance: Board financial packages, budget variance analyses, forecast models, audit prep documentation, spend analysis reports, ROI business cases, financial review presentations
- HR / People: Job descriptions, compensation band analyses, engagement survey syntheses, policy update communications, interview rubrics, performance calibration prep docs, org design proposals
- Legal: Contract redline summaries, compliance audit checklists, policy gap analyses, regulatory change assessments, vendor agreement reviews, privacy impact assessments
- Executive: Board decks, strategic planning documents, org-wide communications, market intelligence briefs, M&A due diligence syntheses, quarterly business reviews, investor narratives

**The employee's profile is provided in the user message. Reference their specific title, team, and level in your response — make it unmistakable that this advice is for THEM, not anyone else.**

FEEDBACK GUIDANCE:
- CRITICAL: All four dimensions are about the USER'S RELATIONSHIP WITH AI SYSTEMS, not about managing people
- Never give feedback about delegating to team members or communicating with humans - it's ALL about AI interaction
- When discussing multi-modal capabilities, focus on Gemini's ability to understand various modalities more than its ability to generate multiple modalities
- When giving feedback, emphasize strategies that focus on personal growth and impact: Build Trust, Grow Together, Solve Impactful Problems, Lead Change, Think Long Term
- Connect AI literacy skills to relevant Twilio Magic Values principles (e.g., effective prompting = "Write it Down", experimentation = "Learn Cheap Lessons", AI transparency = "No Shenanigans")
- Stay LASER FOCUSED on the specific dimension being assessed - don't drift into other topics
- **CONTEXTUAL JUDGMENT**: When users select multiple options, recognize this as SOPHISTICATED - they understand AI use is situational. Frame advice as "expand your toolkit" not "always use the most advanced method." Right-size AI to the task.
- **AVOID ONE-SIZE-FITS-ALL**: Don't imply users should always operate at the highest maturity level. Sometimes "Compliant" approaches are perfectly appropriate. Help users build judgment about WHEN to use different approaches.

WRITING DENSITY — NON-NEGOTIABLE:
- **Every sentence must earn its place.** Each sentence must either: (a) identify a specific gap in their responses, (b) provide a concrete action they can take, or (c) connect to a measurable outcome in their role. If a sentence does none of these, DELETE IT.
- **BANNED PHRASES** — never use these or anything similar: "This is a great foundation", "You're already on the right track", "It's clear that you", "You're doing well with", "This shows that you", "Keep up the good work", "You've demonstrated". These waste tokens and add zero value.
- **Lead with the growth insight, not the compliment.** Your FIRST sentence must name the specific skill gap or growth opportunity. If you want to acknowledge a strength, weave it into advice: "Your habit of [strength] gives you the base to now [growth action]" — never as a standalone praise paragraph.
- **Quick Wins must follow this pattern**: "Instead of [current habit from their responses], [specific new approach] on your next [specific deliverable for their role]." Every Quick Win needs a concrete BEFORE → AFTER contrast.
- **Be an expert coach, not a cheerleader.** Imagine you're an expensive consultant they hired for 15 minutes — make every word count. Directness IS kindness.
- **NEVER end with a summary or motivational sentence.** Your LAST sentence must be your last piece of actionable advice or your last concrete tip — NOT a restatement like "By doing this, you'll elevate your impact" or "These changes will help you grow." If your final sentence doesn't contain a specific action, delete it.
- **NEVER start a sentence with "By enhancing", "By doing this", "By implementing", "This will help you", or "These changes will".** These are summary filler. End on the advice itself.

AI TOOL SELECTION — DYNAMIC APPROACH:

The employee's selected tools are listed in their profile above. Your tool tips should be tailored to what they actually use AND what they should try.

**KNOWN TWILIO TOOLS (you have deep knowledge of these):**
- Gemini: Multimodal input, Gems (custom assistants), conversation history (60-day retention — remind users to save important chats)
- NotebookLM: Document analysis, source grounding, study guides
- GitHub Copilot: AI-powered code completion, chat, and code explanation — available to ALL Twilio employees, not just engineers. Useful for anyone who touches code, scripts, data queries, or wants to understand technical concepts.
- Claude Code: Agentic coding tool that lives in the terminal — reads your codebase, edits files, runs commands, handles multi-step dev tasks autonomously. ONLY relevant for Product and Engineering teams.
- ZoomAI: Meeting summaries, action items, key highlights. Only relevant when meetings are a core part of their work.
- LoomAI: Auto-generates titles, chapters, summaries from video. Only relevant for async video creators.
- FigmaAI: ONLY for Design team employees
- LinkedInAI: ONLY for Talent Acquisition (NOT general HR)
- ZoomInfoAI / JarvisAI: ONLY for Sales team
- LucidAI: ONLY for teams using Lucidchart/Lucidspark (Product, Engineering, Operations)

**MANDATORY TOOL TIPS:**
- GitHub Copilot: MUST appear for EVERY employee. For non-technical roles, frame as a learning/exploration tool (e.g., "use Copilot Chat to explain a code snippet" or "ask Copilot to write a simple data query"). For technical roles, give advanced tips.
- Claude Code: MUST appear for Product and Engineering employees.

**DYNAMIC TOOL TIPS (based on what the user selected):**
- If the user listed tools they use, provide tips for those tools — suggest advanced features or new use patterns they likely haven't tried.
- If the user listed tools you don't recognize (user-specified/custom tools), do your best to identify what the tool is and give a relevant tip. If you truly can't identify it, skip it — don't make things up.
- If the user hasn't tried tools that would clearly help their role, recommend one new tool with a concrete use case.

**TOOL SELECTION RULES:**
1. GitHub Copilot is ALWAYS included. No exceptions.
2. For Product/Engineering: Claude Code is ALWAYS included.
3. Include tips for tools the user already uses (suggest advanced features).
4. NEVER recommend role-specific tools to wrong teams (no FigmaAI to non-Design, no ZoomInfoAI to non-Sales, no Claude Code to non-Product/Engineering, no LinkedInAI to non-Talent-Acquisition).
5. HR/People team does NOT qualify for LinkedInAI unless sub-department is "Talent Acquisition".
6. If the employee already uses Gemini, suggest an ADVANCED feature (Gem creation, multimodal input).
7. Total tools per recommendation: 2–4 tips depending on how many tools the user selected. Mandatory tools + 1–2 from their selected tools. Don't exceed 4.

RECOMMENDATION STRUCTURE:
### What to Focus On
EXACTLY 2 paragraphs. Each paragraph: 3-4 sentences MAX. Hard limits.

**Paragraph 1:** Open with the specific skill gap for THIS dimension. Name what's missing. Then give ONE concrete technique to close the gap, grounded in their role. Reference their work focus or a specific deliverable they produce.

**Paragraph 2:** Provide a second technique or system to build. End with ONE specific pitfall to avoid (the "watch out"), tied to something they actually indicated in their responses.

NO third paragraph. NO validation paragraphs. NO closing summary sentences.

### Quick Wins
EXACTLY 3 bullets. Each bullet MUST follow this pattern:
"Instead of [their current approach from their responses], [specific new technique] on your next [specific deliverable for their role]."

- Bullet 1: A technique they can apply to their PRIMARY work focus (if provided) or main deliverable type
- Bullet 2: A workflow or system change
- Bullet 3: For managers → a team practice to establish. For ICs → a personal habit to build.

NO generic bullets. Every bullet must name a real deliverable.

### Tips for Using AI Tools
2–4 tool tips depending on the employee's selected tools. Each tip gets its own bullet.

For each tool:
- Name the SPECIFIC feature
- Give an executable recipe with a real deliverable from their role
- Example format: "**Gemini → Gem Creation**: Create a Gem called '[Name]' with instructions: '[exact prompt]'. Use it when [specific workflow in their role]."
- **CONVERSATION HISTORY RULE**: Any time you mention Gemini's conversation history, you MUST include the 60-day retention note. Example: "...pick up where you left off in Gemini (your conversations are kept for 60 days, so save anything you want to keep long-term)."
- For user-specified tools you recognize (e.g., Perplexity, Cursor, Midjourney, Claude): give a genuine tip based on what that tool actually does. If you're not confident in the tool's features, skip it.

NO generic tips. If you can't name a specific feature and a real deliverable, don't include the tool.

FORMATTING RULES:
- Use ### for section titles (What to Focus On, Quick Wins, Tips for Using AI Tools)
- Use **bold** for tool names and ONE key concept per paragraph — no more
- Use - for bullet lists in Quick Wins and Tips sections
- Tone: Direct, expert, warm but not sycophantic. No cheerleading. No validation fluff.
- Stay tightly focused on the ONE dimension being assessed
- Total: 300-450 words. Hard cap. Count your words. If over 450, delete sentences until you're under.`;
    
    // API call with retry logic (prevents transient failures from killing the recommendation)
    const MAX_RETRIES = 2;
    const requestBody = JSON.stringify({
        rapid_openai: "$res:u/VinceDeFreitas/rapid_openai",
        messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: prompt }
        ],
        model: CONFIG.OPENAI_MODEL,
        max_tokens: CONFIG.OPENAI_MAX_TOKENS,
        temperature: CONFIG.OPENAI_TEMPERATURE
    });
    
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            if (attempt > 0) {
                console.log(`[AI Rec] Retry ${attempt}/${MAX_RETRIES} for ${category}...`);
                await sleep(2000 * attempt);
            }
            
            console.log(`[AI Rec] Calling Windmill for ${category} (attempt ${attempt + 1}/${MAX_RETRIES + 1})...`);
            const response = await fetch(CONFIG.WINDMILL_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CONFIG.WINDMILL_TOKEN}`
                },
                body: requestBody
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[AI Rec] Windmill API ${response.status} for ${category}:`, errorText.substring(0, 200));
                if (attempt < MAX_RETRIES) continue;
                throw new Error(`Windmill API error: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`[AI Rec] Windmill response for ${category}:`, { success: data.success, hasResponse: !!data.response, hasContent: !!data.content, hasError: !!data.error });
            
            // Handle Windmill response format from Python script
            let recommendationText;
            if (data.success && data.response) {
                // Python script returns data.response (not data.content)
                recommendationText = data.response;
            } else if (data.success && data.content) {
                // Legacy format fallback
                recommendationText = data.content;
            } else if (data.choices && data.choices[0]) {
                // If using OpenAI's native format
                recommendationText = data.choices[0].message.content;
            } else if (data.error) {
                console.error(`[AI Rec] Windmill returned error for ${category}:`, data.error);
                if (attempt < MAX_RETRIES) continue;
                throw new Error(`Windmill error: ${data.error}`);
            } else {
                console.error(`[AI Rec] Unexpected response format for ${category}:`, JSON.stringify(data).substring(0, 300));
                if (attempt < MAX_RETRIES) continue;
                throw new Error('Unexpected response format from Windmill');
            }
            
            // Check if the AI returned an error message instead of a recommendation
            if (recommendationText.includes("essential information is missing") || 
                recommendationText.includes("Could you please provide")) {
                console.warn(`[AI Rec] AI returned error message for ${category}`);
                if (attempt < MAX_RETRIES) continue;
                const staticRecs = generateRecommendations(scores);
                return staticRecs.find(r => r.category === category);
            }
            
            console.log(`[AI Rec] ✅ Successfully generated AI recommendation for ${category} (${recommendationText.length} chars)`);
            return {
                category: category,
                maturity: maturity,
                text: recommendationText
            };
            
        } catch (error) {
            console.error(`[AI Rec] Attempt ${attempt + 1} failed for ${category}:`, error.message);
            if (attempt < MAX_RETRIES) continue;
            
            // All retries exhausted - return static fallback
            console.error(`[AI Rec] ❌ All ${MAX_RETRIES + 1} attempts failed for ${category}, using static fallback`);
            const staticRecs = generateRecommendations(scores);
            return staticRecs.find(r => r.category === category);
        }
    }
}

/**
 * Generate AI-Powered Recommendations Sequentially
 * Generates recommendations one at a time with callback for progressive rendering
 */
async function generateAIRecommendations(scores, onRecommendationReady) {
    // Check if CONFIG exists and AI is enabled
    if (typeof CONFIG === 'undefined' || !CONFIG.USE_AI_RECOMMENDATIONS || CONFIG.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY_HERE') {
        console.log('AI recommendations disabled or API key not configured. Using static recommendations.');
        const staticRecs = generateRecommendations(scores);
        
        // Call the callback for each static recommendation to update UI
        if (onRecommendationReady) {
            staticRecs.forEach(rec => {
                onRecommendationReady(rec, scores);
            });
        }
        
        return staticRecs;
    }
    
    const categories = ['Delegation', 'Communication', 'Discernment', 'Keeping It Twilio'];
    const recommendations = [];
    
    for (const category of categories) {
        console.log(`Generating recommendation for ${category}...`);
        const recommendation = await generateSingleRecommendation(category, scores);
        recommendations.push(recommendation);
        
        // Call the callback immediately with this recommendation
        if (onRecommendationReady) {
            onRecommendationReady(recommendation, scores);
        }
    }
    
    return recommendations;
}

/**
 * Build Recommendation Prompt
 * Creates a detailed prompt for the AI based on user context and scores
 */
function buildRecommendationPrompt(scores) {
    const { jobTitle, team, jobLevel } = state.userContext;
    
    let prompt = `I need personalized AI literacy recommendations for a Twilio employee.\n\n`;
    prompt += `**Role Context:**\n`;
    prompt += `- Job Title: ${jobTitle}\n`;
    prompt += `- Job Level: ${jobLevel} (${getJobLevelDescription(jobLevel)})\n`;
    prompt += `- Team/Department: ${team}\n\n`;
    
    prompt += `**Assessment Results:**\n`;
    prompt += `- Overall Maturity: ${scores.overallMaturity} (${scores.overall.toFixed(2)}/4.00)\n\n`;
    
    state.categories.forEach(category => {
        const score = scores.categories[category.name];
        const maturity = scores.categoryMaturities[category.name];
        prompt += `- ${category.name}: ${maturity} (${score.toFixed(2)}/4.00)\n`;
    });
    
    prompt += `\n**Instructions:**\n`;
    prompt += `Generate 4 highly personalized recommendations (one per category: Delegation, Communication, Discernment, and Keeping It Twilio).\n\n`;
    prompt += `For the ${jobTitle} role in ${team}, think about:\n`;
    prompt += `- What specific tasks do they do daily? What tools do they use?\n`;
    prompt += `- What are their biggest time sinks or repetitive tasks?\n`;
    prompt += `- What kind of outputs do they create (code, emails, reports, designs)?\n`;
    prompt += `- Who do they collaborate with and how?\n`;
    
    // Determine procurement ability from job level (M and E levels typically can procure)
    const canProcure = jobLevel.startsWith('M') || jobLevel.startsWith('E');
    if (canProcure) {
        prompt += `- Based on their ${jobLevel} level, they likely have procurement authority - suggest specific AI tools or platforms they should evaluate for their team\n`;
    } else {
        prompt += `- Direct them to Switchboard (Twilio's AI Hub) to discover available internal tools rather than suggesting new tool procurement\n`;
    }
    prompt += `\n`;
    prompt += `For each recommendation:\n`;
    prompt += `1. Start with a specific use case or workflow for their role\n`;
    prompt += `2. Suggest concrete AI prompts or approaches they can try THIS WEEK\n`;
    prompt += `3. Include what success looks like (e.g., "saves 2 hours/week", "improves response quality")\n`;
    prompt += `4. Make it 3-4 sentences with actionable steps\n`;
    prompt += `5. Reference tools, processes, or scenarios specific to ${team}\n\n`;
    
    prompt += `Format your response as:\n`;
    prompt += `DELEGATION: [your recommendation]\n`;
    prompt += `COMMUNICATION: [your recommendation]\n`;
    prompt += `DISCERNMENT: [your recommendation]\n`;
    prompt += `KEEPING IT TWILIO: [your recommendation]`;
    
    return prompt;
}

/**
 * Parse AI Recommendations
 * Converts AI response text into structured recommendation objects
 */
function parseAIRecommendations(aiResponse, scores) {
    console.log('AI Response:', aiResponse); // Debug log
    const recommendations = [];
    const categories = ['Delegation', 'Communication', 'Discernment', 'Keeping It Twilio'];
    
    categories.forEach(category => {
        // Try multiple regex patterns to be more flexible
        const patterns = [
            new RegExp(`${category.toUpperCase()}:(.+?)(?=\\n(?:DELEGATION|COMMUNICATION|DISCERNMENT|KEEPING IT TWILIO):|$)`, 'si'),
            new RegExp(`##?\\s*${category}[:\\s](.+?)(?=\\n##?\\s*(?:Delegation|Communication|Discernment|Keeping It Twilio)|$)`, 'si'),
            new RegExp(`\\*\\*${category}\\*\\*:?(.+?)(?=\\n\\*\\*(?:Delegation|Communication|Discernment|Keeping It Twilio)|$)`, 'si')
        ];
        
        let match = null;
        for (const pattern of patterns) {
            match = aiResponse.match(pattern);
            if (match && match[1]) break;
        }
        
        if (match && match[1]) {
            recommendations.push({
                category: category,
                maturity: scores.categoryMaturities[category],
                text: match[1].trim()
            });
        } else {
            console.warn(`Failed to parse recommendation for ${category}`);
            // Fallback to static if parsing fails
            const staticRecs = generateRecommendations(scores);
            const staticRec = staticRecs.find(r => r.category === category);
            if (staticRec) {
                recommendations.push(staticRec);
            }
        }
    });
    
    return recommendations;
}


/**
 * Log Assessment Response Anonymously
 * Sends anonymous response data to backend for analytics
 * This is completely invisible to the end user
 */
async function logAssessmentResponse(scores) {
    // Check if logging is enabled and endpoint is configured
    if (!CONFIG.ENABLE_RESPONSE_LOGGING || !CONFIG.LOGGING_ENDPOINT) {
        console.log('Response logging disabled or endpoint not configured');
        return;
    }
    
    try {
        // Prepare anonymous response data
        const responseData = {
            timestamp: new Date().toISOString(),
            
            // User demographics (no personally identifiable information)
            team: state.userContext.team,
            subDepartment: state.userContext.subDepartment || '',
            jobTitle: state.userContext.jobTitle,
            jobLevel: state.userContext.jobLevel,
            aiFrequency: state.userContext.aiFrequency || '',
            aiToolsUsed: state.userContext.aiToolsUsed || [],
            workFocus: state.userContext.workFocus || '',
            
            // Assessment scores
            overallScore: scores.overall,
            overallMaturity: scores.overallMaturity,
            hasNotStarted: scores.hasNotStarted || false,
            
            // Category scores
            categoryScores: {},
            categoryMaturities: {},
            
            // Individual question responses (anonymized)
            responses: {}
        };
        
        // Add category scores
        state.categories.forEach(category => {
            responseData.categoryScores[category.name] = scores.categories[category.name];
            responseData.categoryMaturities[category.name] = scores.categoryMaturities[category.name];
        });
        
        // Add individual responses mapped to question IDs (no personal data)
        Object.keys(state.answers).forEach(questionId => {
            const question = state.questions.find(q => q.id === questionId);
            if (question) {
                responseData.responses[questionId] = {
                    category: question.category,
                    value: state.answers[questionId],
                    maturity: getMaturityLevel(state.answers[questionId])
                };
            }
        });
        
        // Send to Windmill logging endpoint (fire and forget - don't block UI)
        fetch(CONFIG.LOGGING_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.WINDMILL_TOKEN}`
            },
            body: JSON.stringify(responseData)
        }).catch(error => {
            // Silent fail - don't disrupt user experience
            console.log('Failed to log response (non-blocking):', error);
        });
        
        console.log('Assessment response logged successfully (anonymous)');
    } catch (error) {
        // Silent fail - logging should never disrupt the user experience
        console.log('Error preparing response log:', error);
    }
}

/**
 * Submit Assessment
 * Calculates scores and displays results with AI-powered recommendations
 */
async function submitAssessment() {
    const scores = calculateScores();
    
    // Log assessment response anonymously (non-blocking, completely invisible to user)
    logAssessmentResponse(scores).catch(err => {
        console.log('Logging failed silently:', err);
    });
    
    // Show results screen with buttons to generate recommendations on demand
    showScreen('results-screen');
    renderResults(scores, null); // null = show buttons, not loading
    
    // Only clear localStorage saved progress — do NOT wipe state.answers
    // because the async recommendation generation still needs the answer data.
    // Full state reset (including state.answers) happens in restartAssessment().
    localStorage.removeItem('assessmentProgress');
}

/**
 * Update Single Recommendation
 * Updates a single category's recommendation when it's ready
 */
function updateSingleRecommendation(recommendation, scores) {
    const category = state.categories.find(c => c.name === recommendation.category);
    if (!category) return;
    
    const avgScore = scores.categories[category.name] || 0;
    const maturity = scores.categoryMaturities[category.name] || 'Not Started';
    const level = maturityLevels.find(l => l.label === maturity);
    const levelColor = level ? level.color : 'var(--color-neutral-600)';
    
    // Find the existing combined result element for this category
    const combinedResultsEl = document.getElementById('combined-results');
    const allResults = Array.from(combinedResultsEl.querySelectorAll('.combined-result'));
    const categoryIndex = state.categories.findIndex(c => c.name === category.name);
    const resultEl = allResults[categoryIndex];
    
    if (resultEl) {
        // Find the recommendation div and update it with the new content
        const recommendationDiv = resultEl.querySelector('.combined-result__recommendation');
        if (recommendationDiv) {
            // Convert markdown to HTML
            const htmlContent = markdownToHtml(recommendation.text);
            recommendationDiv.innerHTML = `<div class="recommendation-content">${htmlContent}</div>`;
        }
    }
}

/**
 * Render Results
 * Displays overall score with combined category scores and recommendations
 * @param {Object} scores - Calculated scores
 * @param {Array|null} recommendations - Generated recommendations or null for loading state
 */
function renderResults(scores, recommendations) {
    // Overall maturity level (no bar, no score number)
    const overallScoreEl = document.getElementById('overall-score');
    const scoreCelebration = document.getElementById('score-celebration');
    const categoryBreakdownEl = document.getElementById('category-breakdown');
    
    // Get maturity level and color
    const maturityLevel = scores.overallMaturity;
    const level = maturityLevels.find(l => l.label === maturityLevel);
    const levelColor = level ? level.color : 'var(--accent-primary)';
    
    // Display maturity level only
    setTimeout(() => {
        overallScoreEl.textContent = maturityLevel;
        overallScoreEl.style.color = levelColor;
        
        // Trigger celebration effect for high maturity
        if (maturityLevel === 'Creative' || maturityLevel === 'Competent') {
            setTimeout(() => {
                scoreCelebration.classList.add('active');
                setTimeout(() => {
                    scoreCelebration.classList.remove('active');
                }, 3000);
            }, 1000);
        }
    }, 300);
    
    // Create category breakdown bars
    const displayNames = {
        'Delegation': 'Delegating to AI systems',
        'Communication': 'Communicating with AI systems',
        'Discernment': 'Discernment and Judgement',
        'Keeping It Twilio': 'Keeping It Twilio'
    };
    
    categoryBreakdownEl.innerHTML = '';
    state.categories.forEach(category => {
        const avgScore = scores.categories[category.name] || 0;
        const maturity = scores.categoryMaturities[category.name] || 'Not Started';
        const level = maturityLevels.find(l => l.label === maturity);
        const levelColor = level ? level.color : 'var(--color-neutral-600)';
        const percentage = (avgScore / 4) * 100;
        const displayName = displayNames[category.name] || category.name;
        
        const breakdownItem = document.createElement('div');
        breakdownItem.className = 'breakdown-item';
        breakdownItem.innerHTML = `
            <div class="breakdown-item__header">
                <span class="breakdown-item__name">${displayName}</span>
                <span class="breakdown-item__score">${avgScore.toFixed(2)}/4.00</span>
                <span class="breakdown-item__maturity" style="color: ${levelColor}">${maturity}</span>
            </div>
            <div class="breakdown-item__bar">
                <div class="breakdown-item__fill" style="width: ${percentage}%; background-color: ${levelColor}"></div>
            </div>
        `;
        categoryBreakdownEl.appendChild(breakdownItem);
    });
    
    // Tabbed interface for recommendations
    const combinedResultsEl = document.getElementById('combined-results');
    combinedResultsEl.innerHTML = '';
    
    // Add AI disclaimer
    const disclaimer = document.createElement('div');
    disclaimer.className = 'ai-disclaimer';
    disclaimer.innerHTML = `
        <p><strong>⚠️ AI-Generated Content:</strong> The recommendations below are generated by AI and may occasionally contain errors or suggest features that don't exist. Always verify suggestions before implementing them.</p>
    `;
    combinedResultsEl.appendChild(disclaimer);
    
    // Create tabs container
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'tabs-container';
    
    // Create tabs header
    const tabsHeader = document.createElement('div');
    tabsHeader.className = 'tabs-header';
    
    // Create tabs content
    const tabsContent = document.createElement('div');
    tabsContent.className = 'tabs-content';
    
    state.categories.forEach((category, index) => {
        const displayName = displayNames[category.name] || category.name;
        const isActive = index === 0;
        
        // Create tab button
        const tabBtn = document.createElement('button');
        tabBtn.className = `tab-btn ${isActive ? 'active' : ''}`;
        tabBtn.dataset.category = category.name;
        tabBtn.textContent = displayName;
        tabsHeader.appendChild(tabBtn);
        
        // Create tab panel
        const tabPanel = document.createElement('div');
        tabPanel.className = `tab-panel ${isActive ? 'active' : ''}`;
        tabPanel.dataset.category = category.name;
        tabPanel.dataset.generated = 'false';
        tabPanel.innerHTML = `
            <div class="tab-panel__recommendation" id="rec-${category.name}">
                <div class="recommendation-placeholder">
                    <p>Loading recommendations...</p>
                </div>
            </div>
        `;
        tabsContent.appendChild(tabPanel);
    });
    
    tabsContainer.appendChild(tabsHeader);
    tabsContainer.appendChild(tabsContent);
    combinedResultsEl.appendChild(tabsContainer);
    
    // Simple async function for generating a single tab's recommendation
    async function generateRecommendationForTab(category, tabPanel) {
        // Check if already generated
        if (tabPanel.dataset.generated === 'true') {
            return;
        }
        
        const recContainer = document.getElementById(`rec-${category}`);
        if (!recContainer) {
            console.error(`[AI Rec] Container not found for category: ${category}`);
            return;
        }
        
        // Show loading state
        recContainer.innerHTML = `
            <div class="loading-recommendation">
                <div class="loading-spinner"></div>
                <p>Generating personalized recommendations for ${category}...</p>
            </div>
        `;
        
        try {
            console.log(`[AI Rec] Starting generation for ${category}...`);
            const recommendation = await generateSingleRecommendation(category, scores);
            if (recommendation && recommendation.text) {
                const isAI = recommendation.text.length > 200;
                console.log(`[AI Rec] ${category} complete (${isAI ? 'AI' : 'STATIC'}, ${recommendation.text.length} chars)`);
                recContainer.innerHTML = `<div class="recommendation-content">${markdownToHtml(recommendation.text)}</div>`;
            } else {
                console.warn(`[AI Rec] No recommendation returned for ${category}, using static`);
                const staticRecs = generateRecommendations(scores);
                const staticRec = staticRecs.find(r => r.category === category);
                recContainer.innerHTML = `<div class="recommendation-content">${markdownToHtml(staticRec ? staticRec.text : 'Unable to generate recommendation.')}</div>`;
            }
            tabPanel.dataset.generated = 'true';
        } catch (error) {
            console.error(`[AI Rec] Unhandled error for ${category}:`, error);
            try {
                const staticRecs = generateRecommendations(scores);
                const staticRec = staticRecs.find(r => r.category === category);
                recContainer.innerHTML = `<div class="recommendation-content">${markdownToHtml(staticRec ? staticRec.text : 'Unable to generate recommendation.')}</div>`;
            } catch (fallbackError) {
                console.error(`[AI Rec] Even static fallback failed for ${category}:`, fallbackError);
                recContainer.innerHTML = `<div class="recommendation-content"><p>Unable to generate recommendation. Please try restarting the assessment.</p></div>`;
            }
            tabPanel.dataset.generated = 'true';
        }
        
        checkAllRecommendationsGenerated();
    }
    
    // Check if all recommendations have been generated
    function checkAllRecommendationsGenerated() {
        const allPanels = document.querySelectorAll('.tab-panel');
        const allGenerated = Array.from(allPanels).every(panel => panel.dataset.generated === 'true');
        
        const printBtn = document.getElementById('print-btn');
        if (allGenerated) {
            printBtn.disabled = false;
            printBtn.title = 'Print or save your results as PDF';
        } else {
            printBtn.disabled = true;
            printBtn.title = 'Generate all recommendations to enable PDF export';
        }
    }
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const category = this.dataset.category;
            
            // Update active tab button
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update active tab panel
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            const activePanel = document.querySelector(`.tab-panel[data-category="${category}"]`);
            activePanel.classList.add('active');
            
            // Scroll to the tabs area so user stays in context
            const tabsContainer = document.querySelector('.tabs-container');
            if (tabsContainer) {
                tabsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            
            // Generate recommendation for this tab if not already done
            // (should already be generated from the sequential loop below, but just in case)
            await generateRecommendationForTab(category, activePanel);
        });
    });
    
    // Auto-generate ALL tabs sequentially on page load
    // Sequential (not parallel) to avoid overwhelming the Windmill API
    (async function generateAllTabs() {
        console.log('[AI Rec] Starting sequential generation of all tabs...');
        for (const category of state.categories) {
            const panel = document.querySelector(`.tab-panel[data-category="${category.name}"]`);
            if (panel && panel.dataset.generated !== 'true') {
                await generateRecommendationForTab(category.name, panel);
            }
        }
        console.log('[AI Rec] All tabs generation complete.');
    })();
    
    // Next button to navigate between tabs
    document.getElementById('next-tab-btn').addEventListener('click', function() {
        const currentActiveBtn = document.querySelector('.tab-btn.active');
        const allBtns = Array.from(document.querySelectorAll('.tab-btn'));
        const currentIndex = allBtns.indexOf(currentActiveBtn);
        const nextIndex = (currentIndex + 1) % allBtns.length;
        
        // Click the next tab button
        allBtns[nextIndex].click();
        
        // Scroll to top of results
        document.querySelector('.tabs-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    
    // Back button to navigate to previous tab
    document.getElementById('prev-tab-btn').addEventListener('click', function() {
        const currentActiveBtn = document.querySelector('.tab-btn.active');
        const allBtns = Array.from(document.querySelectorAll('.tab-btn'));
        const currentIndex = allBtns.indexOf(currentActiveBtn);
        const prevIndex = (currentIndex - 1 + allBtns.length) % allBtns.length;
        
        // Click the previous tab button
        allBtns[prevIndex].click();
        
        // Scroll to tabs area
        document.querySelector('.tabs-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

/**
 * Show Screen
 * Manages screen transitions (welcome, questionnaire, results)
 * @param {string} screenId - ID of the screen to display
 */
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('screen--active');
    });
    document.getElementById(screenId).classList.add('screen--active');
}

/**
 * Restart Assessment
 * Resets state and returns to welcome screen
 */
function restartAssessment() {
    state.currentQuestionIndex = 0;
    state.currentSection = 0;
    state.answers = {};
    clearProgress();
    showScreen('welcome-screen');
}

/**
 * Print Report
 * Triggers browser print dialog for PDF export
 */
function printReport() {
    window.print();
}

/**
 * Animate Value Counter
 * Smoothly animates a number from start to end
 */
function animateValue(element, start, end, duration) {
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.round(start + (end - start) * easeOutQuart);
        
        element.textContent = current + '%';
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
