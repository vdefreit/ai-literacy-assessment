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
        jobLevel: ''
    }
};

/**
 * Maturity Levels - 4-stage progression model
 * Each question maps to one of these maturity levels
 */
const maturityLevels = [
    { value: 1, label: 'Not Started', color: '#d61f1f' },   // Red - Twilio Paste error color
    { value: 2, label: 'Compliant', color: '#d97706' },     // Darker Orange - Better contrast for accessibility
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
        text: 'Understanding the problem: When working with AI tools and systems…',
        category: 'Delegation',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I provide generic prompts without context, often resulting in AI outputs that are too broad or irrelevant to the problem I\'m solving.'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I include basic operational details and department-approved goals in my instructions, ensuring the AI stays aligned with our standard KPIs.'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I provide "signal" by including root-cause data and cross-functional impacts, enabling the AI to separate relevant information from noise and offer business-aligned solutions.'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I synthesize complex, conflicting data points within the prompt to uncover non-obvious patterns, using AI to anticipate future risks and build proactive mitigation strategies.'
            }
        ],
        weight: 1.0
    },
    {
        id: 'q2',
        text: 'Understanding the goal: When working with AI tools and systems…',
        category: 'Delegation',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I provide vague goals (e.g., "make this better"), which leads to generic AI outputs that rarely meets my needs.'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I define success using standard benchmarks and KPIs in my prompts, ensuring the AI output is safe and meets minimum departmental requirements.'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I translate high-level business objectives into specific constraints for the AI, resulting in highly relevant outcomes that align with my problem-statement and needs.'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I build context over time with AI tools through clear examples and repeated system utilization to balance immediate results with sustainable innovation and future-readiness.'
            }
        ],
        weight: 1.0
    },
    {
        id: 'q3',
        text: 'Task decomposition: When planning and sharing a plan with AI tools and systems…',
        category: 'Delegation',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I feed AI entire projects as a single block; I rely on the AI to "figure out" the steps, which often results in superficial or missing sub-tasks.'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I provide the AI with a pre-defined list of linear steps; I use the system to complete one phase at a time based on our standard team checklist.'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I define the logical dependencies between tasks for the AI; I provide a structured sequence that ensures the AI understands how the output of one "unit of work" feeds into the next.'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I architect multi-threaded workflows; I use AI to simultaneously solve different elements of a problem, then synthesize those parallel outputs into a single, innovative solution.'
            }
        ],
        weight: 1.0
    },
    {
        id: 'q4',
        text: 'Platform Awareness: When selecting which AI tool or service to use…',
        category: 'Delegation',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I use whichever tool is most convenient without knowing its technical limitations or approval status.'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I use only enterprise-approved platforms and stay within compliant boundaries, ensuring my team uses safe, vetted tools for basic tasks.'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I understand the specific strengths of different models (e.g., reasoning vs. creativity) and guide my team on selecting the tool best suited for the task.'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I stay ahead of emerging features, strategically pairing unique platform capabilities with complex business challenges to create previously unattainable value.'
            }
        ],
        weight: 1.0
    },
    // Section 2: Communication & Clarity
    {
        id: 'q5',
        text: 'Output Description: When instructing AI tools and systems...',
        category: 'Communication',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I struggle to describe what a final output should look like, often providing vague or generic requests that lead to mismatched results'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I can describe outputs using company-provided prompt templates, plugging in my details to the prompt framework'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I use and modify structured prompts that I have created or that have been shared with my by peers and/or my organization'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I write my own prompts, specifying the target audience, tone, and constraints, enabling the AI to produce ready-to-use outputs that require minimal edits'
            }
        ],
        weight: 1.0
    },
    {
        id: 'q6',
        text: 'Process Clarity: When instructing AI tools and systems…',
        category: 'Communication',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I ask the AI for a "final result" without explaining the steps it should take, leaving the logic entirely up to the model\'s default settings.'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I provide the AI with a standard operating procedure to follow, ensuring it replicates our existing manual steps accurate'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I can explain the logic behind each relevant step of a process, allowing the AI to troubleshoot its own bottlenecks and reason through complex tasks.'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I deconstruct tasks to identify parallel processes and enable AI systems to work effectively by balancing detail with ambiguity, leveraging the natural strength of the selected model'
            }
        ],
        weight: 1.0
    },
    {
        id: 'q7',
        text: 'Performance Expectations: When setting expectations while working with AI tools...,',
        category: 'Communication',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I do not set performance standards, I typically realize that work is subpar once it is finished and delivered'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I provide the AI with a basic checklist of constraints to follow, ensuring the output meets my expectations'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I give the AI specific examples of good vs great work, improving the model\'s ability to anticipate the quality of work that I\'m expecting'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I collaborate with AI to brainstorm and improve the overall quality of my work before implementing a pre-set plan without considering how this work might be better'
            }
        ],
        weight: 1.0
    },
    {
        id: 'q8',
        text: 'Context Aggregation: When providing context to AI models...',
        category: 'Communication',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I don\'t often know what types of resources or items are safe, or relevant to share with the model'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I provide relevant context that keeps with my organization\'s AI acceptable use policy, helping the AI to produce satisfactory outputs'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I think critically about what types of information are relevant, to avoid overloading the model\'s context window and improve output quality'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I leverage multi-modal capabilities, manage context window capacity and continuously share updated snippets of my work to the AI to build context over time'
            }
        ],
        weight: 1.0
    },
    // Section 3: Discernment
    {
        id: 'q9',
        text: 'Domain/Craft Expertise: When evaluating AI-generated outputs…',
        category: 'Discernment',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I rely on AI or my peers to judge quality, as I am still establishing the best practices and benchmarks on what \'good looks like\' for this specific craft.'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I check the results against our established team standards and internal benchmarks to ensure the output is safe and meets minimum functional needs.'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I apply my current understanding of industry standards to identify when the AI\'s guidance is accurate and where it fails to meet professional quality.'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I leverage my expertise to push the AI beyond standard strategies, recognizing new ways to solve old problems through advanced technologies'
            }
        ],
        weight: 1.0
    },
    {
        id: 'q10',
        text: 'Logic and Reasoning: When auditing the "thinking" behind an AI\'s plan...',
        category: 'Discernment',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I focus almost entirely on the final recommendation, sometimes missing gaps in the model\'s underlying logic or reasoning'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I follow a basic step-by-step review to see if the AI\'s plan makes sense and aligns with our core operational tasks and team requirements.'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I use available information to understand the AI\'s strategy to find logical gaps or hidden assumptions, ensuring the path to the solution is robust and defensible.'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I stress-test the AI\'s reasoning from multiple viewpoints, identifying potential biases or systemic flaws before they can impact the final outcome.'
            }
        ],
        weight: 1.0
    },
    {
        id: 'q11',
        text: 'Coaching for Improvement: When providing feedback to refine AI outputs...',
        category: 'Discernment',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I rely on a gut feeling for whether the AI met expectations, providing feedback that focuses on what is wrong rather than how to fix it.'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I identify when the AI output meets the minimum required standards and point out specific errors that prevent the deliverable from being acceptable.'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I clearly define the difference between pass and high-quality outputs, giving the AI specific guidance on how to refine its logic or tone.'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I envision how good AI work can be transformed into industry-leading results, providing strategic feedback that pushes the model to innovate beyond the brief.'
            }
        ],
        weight: 1.0
    },
    // Section 4: Keeping it Twilio
    {
        id: 'q12',
        text: 'Data Stewardship: When managing data privacy and security with AI...',
        category: 'Keeping It Twilio',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I am completely unfamiliar with my company\'s AI usage policies'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I follow established corporate data policies and ensure that my team only uses approved platforms for departmental work.'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I establish a clear human-in-the-loop approach, ensuring that a person is always accountable for the final verification of any AI-processed data.'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I model radical accountability, creating a culture where AI is seen as an extension of the team\'s capabilities and errors are used as transparent learning opportunities.'
            }
        ],
        weight: 1.0
    },
    {
        id: 'q13',
        text: 'Bias & Fairness Awareness: When identifying and mitigating AI-generated bias…',
        category: 'Keeping It Twilio',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I am unaware of how AI training affects a model\'s ability to reinforce bias and do not check outputs for skewed perspectives.'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I use my knowledge of Twilio\'s diversity guidelines to review AI work and ensure the results do not violate basic fairness standards.'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I actively look for blind-spots in AI prompts and outputs, encouraging my team to challenge AI logic that appears one-sided.'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I work collaboratively with AI to uncover hidden biases and craft intentional prompts that ensure our strategies meet or exceed organizational expectations.'
            }
        ],
        weight: 1.0
    },
    {
        id: 'q14',
        text: 'AI Literacy: As it relates to how AI works…',
        category: 'Keeping It Twilio',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'It\'s a black-box and I do not understand the underlying technology, making it difficult for me to understand or anticipate why the system might not deliver the result I\'m expecting'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I have a basic understanding of what AI systems can do, based on training that has been provided to me, or information I have found independently'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I have completed structured training and understand core concepts like machine learning, inference and probabilistic systems, helping me to critically evaluate AI results to ensure my team uses the technology responsibly and reliably.'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I have a deep grasp of model architecture and limitations, enabling me to architect complex, compliant workflows that push the boundaries of what individuals are doing with AI inside of my organization.'
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
    { name: 'Delegation', description: 'Making thoughtful decisions about what work to hand over to AI systems' },
    { name: 'Communication', description: 'Clear communication when working with AI systems' },
    { name: 'Discernment', description: 'Evaluating AI outputs and behavior with a critical eye' },
    { name: 'Keeping It Twilio', description: 'Smart, responsible and ethical AI collaborations aligned with Twilio values' }
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
        questions: state.questions.filter(q => q.category === category.name)
    }));
    
    // Set up event listeners
    document.getElementById('start-btn').addEventListener('click', startAssessment);
    document.getElementById('next-btn').addEventListener('click', nextQuestion);
    document.getElementById('prev-btn').addEventListener('click', prevQuestion);
    document.getElementById('submit-btn').addEventListener('click', submitAssessment);
    document.getElementById('restart-btn').addEventListener('click', restartAssessment);
    document.getElementById('print-btn').addEventListener('click', printReport);
    
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
 * Start Assessment
 * Validates user context and transitions from welcome screen to questionnaire
 */
function startAssessment() {
    // Get and validate user context
    const jobTitle = document.getElementById('job-title').value.trim();
    const team = document.getElementById('team').value;
    const jobLevel = document.getElementById('job-level').value;
    
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
    
    // Store user context
    state.userContext = {
        jobTitle: jobTitle,
        team: team,
        jobLevel: jobLevel
    };
    
    showScreen('questionnaire-screen');
    renderQuestion();
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
    answerOptionsEl.setAttribute('aria-label', 'Answer options');
    
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
        
        // Check if this option is already selected
        if (state.answers[question.id] === option.value) {
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
    state.answers[questionId] = value;
    
    // Update UI to show selected answer and ARIA states
    const options = document.querySelectorAll('.answer-option');
    options.forEach(option => {
        option.classList.remove('answer-option--selected');
        const optionValue = parseInt(option.dataset.value);
        if (optionValue === value) {
            option.classList.add('answer-option--selected');
            option.setAttribute('aria-pressed', 'true');
        } else {
            option.setAttribute('aria-pressed', 'false');
        }
    });
    
    // Save progress to localStorage
    saveProgress();
    
    updateNavigation();
}

/**
 * Update Double-click Hint Visibility
 * Shows hint on first 3 questions
 */
function updateDoubleClickHint() {
    const hintEl = document.getElementById('double-click-hint');
    
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
    
    // Next/Submit button
    const hasAnswer = state.answers[currentQuestion.id] !== undefined;
    
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
    const hasAnswer = state.answers[currentQuestion.id] !== undefined;
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
}

/**
 * Next Question
 * Advances to the next question in the assessment
 * Handles section transitions with visual feedback
 */
function nextQuestion() {
    if (state.currentQuestionIndex < state.questions.length - 1) {
        const currentQuestion = state.questions[state.currentQuestionIndex];
        const nextQuestionData = state.questions[state.currentQuestionIndex + 1];
        
        // Add transition class
        const container = document.querySelector('.question-container');
        if (container) {
            container.classList.add('transitioning-out');
            
            setTimeout(() => {
                // Check if we're moving to a new section
                if (currentQuestion.category !== nextQuestionData.category) {
                    state.currentSection++;
                }
                
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
                // Check if we're moving to a previous section
                if (currentQuestion.category !== prevQuestionData.category) {
                    state.currentSection--;
                }
                
                state.currentQuestionIndex--;
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
    
    // Initialize category data
    state.categories.forEach(category => {
        categoryScores[category.name] = 0;
        categoryCounts[category.name] = 0;
    });
    
    // Calculate scores per category
    state.questions.forEach(question => {
        const answer = state.answers[question.id];
        if (answer !== undefined) {
            categoryScores[question.category] += answer;
            categoryCounts[question.category] += 1;
        }
    });
    
    // Calculate averages (maturity level average)
    Object.keys(categoryScores).forEach(category => {
        if (categoryCounts[category] > 0) {
            categoryAverages[category] = categoryScores[category] / categoryCounts[category];
        } else {
            categoryAverages[category] = 0;
        }
    });
    
    // Calculate overall score (average of all category averages)
    const overallAverage = Object.values(categoryAverages).reduce((a, b) => a + b, 0) / Object.keys(categoryAverages).length;
    
    // Determine maturity level for overall score
    const overallMaturity = getMaturityLevel(overallAverage);
    
    return {
        overall: overallAverage,
        overallMaturity: overallMaturity,
        categories: categoryAverages,
        categoryMaturities: Object.fromEntries(
            Object.entries(categoryAverages).map(([cat, avg]) => [cat, getMaturityLevel(avg)])
        )
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
            text: 'You\'re ready to architect AI-human workflows. Design systems where AI handles parallel workstreams while you focus on strategic oversight. Experiment with multi-step AI processes and teach your team to identify high-value delegation opportunities. Consider creating templates for common delegation patterns.'
        });
    } else {
        recommendations.push({
            category: 'Delegation',
            maturity: scores.categoryMaturities['Delegation'],
            text: 'You\'re operating at an expert level. Share your delegation frameworks with the organization. Mentor others on sophisticated AI delegation strategies. Push boundaries by exploring emerging AI capabilities and creating innovative workflows that weren\'t previously possible.'
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
            text: 'Your communication skills are exceptional. Lead workshops on effective AI communication. Create organizational standards for prompt engineering and process documentation. Help others develop the clarity that makes AI collaboration successful.'
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
            text: 'Your discernment is exceptional. Lead the organization in establishing quality standards for AI-assisted work. Create training programs on critical evaluation. Push the boundaries by identifying novel applications where your expert judgment can unlock new AI capabilities.'
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
            text: 'Establish a "human-in-the-loop" practice for your team. Ensure someone always reviews AI outputs before they go to customers or stakeholders. Create guidelines for your team on responsible AI use. Actively look for potential biases in AI outputs and challenge assumptions.'
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
            text: 'You\'re a leader in responsible AI use. Champion ethical AI practices across the organization. Create frameworks that help others align AI use with Twilio values. Use AI strategically to amplify what makes Twilio unique. Set the standard for how AI can enhance, not replace, human judgment and Twilio\'s culture.'
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
    // Check if CONFIG exists and Windmill is configured
    if (typeof CONFIG === 'undefined' || !CONFIG.USE_AI_RECOMMENDATIONS || CONFIG.WINDMILL_ENDPOINT === 'YOUR_WINDMILL_WEBHOOK_URL_HERE') {
        console.log(`CONFIG not available or AI disabled, using static recommendation for ${category}`);
        const staticRecs = generateRecommendations(scores);
        return staticRecs.find(r => r.category === category);
    }
    
    const { jobTitle, team, jobLevel } = state.userContext;
    
    let prompt = `Generate ONE detailed recommendation for a ${jobTitle} (${jobLevel}) at Twilio in ${team}.\n\n`;
    prompt += `**Role Context:**\n`;
    prompt += `- Job Level: ${jobLevel} (${getJobLevelDescription(jobLevel)})\n\n`;
    prompt += `**Category to focus on: ${category}**\n\n`;
    prompt += `**Their Overall Score:**\n`;
    const score = scores.categories[category];
    const maturity = scores.categoryMaturities[category];
    prompt += `- ${category}: ${maturity} (${score.toFixed(2)}/4.00)\n\n`;
    
    // Add specific question responses for this category
    prompt += `**THEIR ACTUAL RESPONSES in ${category} - USE THESE TO GROUND YOUR FEEDBACK:**\n`;
    const categoryQuestions = state.questions.filter(q => q.category === category);
    categoryQuestions.forEach(question => {
        const answer = state.answers[question.id];
        if (answer) {
            const selectedOption = question.options.find(opt => opt.value === answer);
            if (selectedOption) {
                // Extract the question subcategory (before the colon)
                const colonIndex = question.text.indexOf(':');
                const subcategory = colonIndex !== -1 ? question.text.substring(0, colonIndex).trim() : question.text;
                
                prompt += `\n**${subcategory}:**\n`;
                prompt += `Selected: ${selectedOption.label} (${answer}/4)\n`;
                prompt += `Their behavior: "${selectedOption.description}"\n`;
            }
        }
    });
    
    prompt += `\n\n**CRITICAL INSTRUCTIONS:**\n`;
    prompt += `1. DIRECTLY REFERENCE their actual selected behaviors above - don't be generic\n`;
    prompt += `2. If they scored 1-2 on something, call out THAT SPECIFIC behavior they described and how to improve it\n`;
    prompt += `3. If they scored 3-4 on something, acknowledge THAT SPECIFIC strength they demonstrated\n`;
    prompt += `4. Make it feel like you read their actual responses, not a template\n`;
    prompt += `5. Be specific about which behaviors to START, STOP, or CONTINUE based on what they selected\n\n`;
    prompt += `Use markdown formatting with the structure from your system prompt.`;
    
    // System message for the AI coach
    const systemMessage = `You are an experienced AI literacy coach at Twilio helping employees improve their AI collaboration skills.

TWILIO CONTEXT - Available AI Tools:
- Google Gemini: Primary conversational AI tool. Features include multimodal input (text, images, PDFs), conversation history, Gems (custom AI assistants you can create and share)
- NotebookLM: AI research assistant that grounds responses in uploaded documents. Great for analyzing multiple sources and creating study guides
- ZoomAI: Meeting assistant integrated into Zoom. Captures meeting summaries, action items, and key highlights. Only mention when relevant to meetings/collaboration
- LoomAI: Video message assistant. Auto-generates titles, chapters, summaries, and tasks from Loom videos. Only mention when relevant to async video communication
- OpenAI API: Available for developers (not the webapp) to build custom solutions
- Switchboard: Twilio's internal intranet - THE go-to resource for AI policies, privacy guidelines, approved tools, and best practices

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

1. DELEGATION (to AI systems):
   - How the user delegates tasks TO AI tools/LLMs (not to humans)
   - User's ability to break down problems and assign appropriate work to AI
   - Skill in determining what tasks AI can handle vs. what requires human judgment
   - Providing AI with clear scope, context, and boundaries for tasks
   
2. COMMUNICATION (with AI systems):
   - How the user communicates intent, quality expectations, and requirements TO AI systems
   - Crafting effective prompts that get high-quality outputs
   - Setting clear success criteria and constraints for AI-generated work
   - Iterating on prompts to refine AI understanding and outputs
   
3. DISCERNMENT (of AI outputs):
   - User's ability to audit and evaluate AI-generated outputs
   - Providing high-quality feedback to AI tools/models/LLMs to improve results
   - Identifying hallucinations, errors, biases, or limitations in AI responses
   - Knowing when to trust AI output vs. when to verify or override
   
4. KEEPING IT TWILIO:
   - Risk management when using AI tools (data privacy, security, compliance)
   - Adhering to Twilio Magic Values while working with AI
   - Responsible AI use, bias awareness, and ethical considerations
   - Ensuring AI usage aligns with company policies and values

FEEDBACK GUIDANCE:
- CRITICAL: All four dimensions are about the USER'S RELATIONSHIP WITH AI SYSTEMS, not about managing people
- Never give feedback about delegating to team members or communicating with humans - it's ALL about AI interaction
- When discussing multi-modal capabilities, focus on Gemini's ability to understand various modalities more than its ability to generate multiple modalities
- When giving feedback to Leaders/Managers, emphasize strategies that focus on Twilio's leadership expectations: Build Trust, Grow Together, Solve Impactful Problems, Lead Change, Think Long Term
- When referencing Twilio's Leadership Expectations to Leaders, specifically call it "Twilio's Leadership Expectations"
- Connect AI literacy skills to relevant Twilio Magic Values principles (e.g., effective prompting = "Write it Down", experimentation = "Learn Cheap Lessons", AI transparency = "No Shenanigans")
- Stay LASER FOCUSED on the specific dimension being assessed - don't drift into other topics

AVAILABLE AI TOOLS FOR TIPS SECTION:
- Gemini: Available to all - multimodal input, Gems, conversation history
- NotebookLM: Available to all - document analysis, source grounding, study guides
- ZoomAI: Available to all - meeting summaries, action items, highlights
- LoomAI: Available to all - video titles, chapters, summaries from Loom videos
- FigmaAI: Available to Design team - AI features in Figma
- LinkedInAI: Available to People/Talent team - LinkedIn Recruiter AI features
- LucidAI: Available to relevant teams - Lucidchart/Lucidspark AI features
- ZoomInfoAI: Available to Sales team - ZoomInfo Copilot features

RECOMMENDATION STRUCTURE:
### What to Focus On
2-3 concise paragraphs covering:
- The specific skill they need to develop for THIS dimension only
- Clear, actionable steps they can take immediately
- How this will improve their effectiveness with AI
- One key pitfall to avoid at their level

### Quick Wins
- 2-3 concrete actions they can take this week
- Simple practices to build into their workflow
- Low-effort, high-impact improvements

### Tips for Using AI Tools
- Select 2-4 tools from the available list that are MOST RELEVANT to their role and the dimension
- Prioritize Gemini and NotebookLM (available to all) as primary recommendations
- Only include role-specific tools (FigmaAI, LinkedInAI, LucidAI, ZoomInfoAI) if they match the user's team
- Only include ZoomAI/LoomAI if relevant to their work (meetings, video communication)
- For each tool, provide specific, real features that exist today - no invented capabilities
- Show HOW to use these features for the specific dimension being assessed

FORMATTING RULES:
- Use ### for section titles (What to Focus On, Quick Wins, Tips for Using AI Tools)
- Use **bold** for key concepts within paragraphs
- Use - for bullet lists
- Keep it conversational and encouraging
- Stay tightly focused on the ONE dimension being assessed
- Total: 350-450 words`;
    
    try {
        // Call Windmill backend instead of OpenAI directly
        const response = await fetch(CONFIG.WINDMILL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.WINDMILL_TOKEN}`
            },
            body: JSON.stringify({
                rapid_openai: "$res:u/VinceDeFreitas/rapid_openai", // Windmill resource reference
                messages: [
                    {
                        role: 'system',
                        content: systemMessage
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                model: CONFIG.OPENAI_MODEL,
                max_tokens: CONFIG.OPENAI_MAX_TOKENS,
                temperature: CONFIG.OPENAI_TEMPERATURE
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Windmill API error:', errorText);
            throw new Error(`Windmill API error: ${response.status}`);
        }
        
        const data = await response.json();
        
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
            throw new Error(`Windmill error: ${data.error}`);
        } else {
            throw new Error('Unexpected response format from Windmill');
        }
        
        
        return {
            category: category,
            maturity: maturity,
            text: recommendationText
        };
    } catch (error) {
        console.error(`Error generating recommendation for ${category}:`, error);
        // Return static fallback
        const staticRecs = generateRecommendations(scores);
        return staticRecs.find(r => r.category === category);
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
 * Submit Assessment
 * Calculates scores and displays results with AI-powered recommendations
 */
async function submitAssessment() {
    const scores = calculateScores();
    
    // Show results screen with buttons to generate recommendations on demand
    showScreen('results-screen');
    renderResults(scores, null); // null = show buttons, not loading
    
    // Clear progress after completion
    clearProgress();
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
    
    // Add tab switching functionality with auto-generation
    async function generateRecommendationForTab(category, tabPanel) {
        // Check if already generated
        if (tabPanel.dataset.generated === 'true') {
            return;
        }
        
        const recContainer = document.getElementById(`rec-${category}`);
        
        // Show loading state
        recContainer.innerHTML = `
            <div class="loading-recommendation">
                <div class="loading-spinner"></div>
                <p>Generating personalized recommendations for ${category}...</p>
            </div>
        `;
        
        // Generate recommendation
        try {
            const recommendation = await generateSingleRecommendation(category, scores);
            recContainer.innerHTML = `<div class="recommendation-content">${markdownToHtml(recommendation.text)}</div>`;
            tabPanel.dataset.generated = 'true';
        } catch (error) {
            console.error(`Error generating recommendation for ${category}:`, error);
            const staticRecs = generateRecommendations(scores);
            const staticRec = staticRecs.find(r => r.category === category);
            recContainer.innerHTML = `<div class="recommendation-content">${markdownToHtml(staticRec.text)}</div>`;
            tabPanel.dataset.generated = 'true';
        }
        
        // Check if all recommendations are generated
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
            
            // Auto-generate recommendation for this tab if not already generated
            await generateRecommendationForTab(category, activePanel);
        });
    });
    
    // Auto-generate the first tab's recommendation on page load
    const firstCategory = state.categories[0].name;
    const firstPanel = document.querySelector(`.tab-panel[data-category="${firstCategory}"]`);
    generateRecommendationForTab(firstCategory, firstPanel);
    
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
