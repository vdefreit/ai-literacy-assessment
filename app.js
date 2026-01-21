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
    sections: []               // Array of section objects with questions
};

/**
 * Maturity Levels - 4-stage progression model
 * Each question maps to one of these maturity levels
 */
const maturityLevels = [
    { value: 1, label: 'Not Started', color: '#d61f1f' },   // Red - Twilio Paste error color
    { value: 2, label: 'Compliant', color: '#f7a600' },     // Orange - Twilio Paste warning color
    { value: 3, label: 'Competent', color: '#14b053' },     // Green - Twilio Paste success color
    { value: 4, label: 'Creative', color: '#0263e0' }       // Blue - Twilio Paste primary color
];

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
        text: 'Understanding the problem: When working with AI tools and systems, I explain the relevant context of the task that enables AI to successfully assist or streamline the work.',
        category: 'Delegation',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I provide generic prompts without context, often resulting in AI outputs that are too broad or irrelevant to my function\'s actual problems.'
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
        text: 'Understanding the goal: When working with AI, I can clearly define and articulate what success looks like so the system generates high-value outcomes.',
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
        text: 'Task decomposition: When working with AI, I can break complex plans into discrete parts to delegate specific elements to the most capable system or person.',
        category: 'Delegation',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I tend to feed AI entire projects as a single block, which often causes the system to miss the nuanced sub-tasks required for a finished solution.'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I can break a plan into high-level phases for the AI, ensuring that the work is divided according to standard operating procedures and known roles.'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I isolate specific dependencies and sequence tasks for the AI logically, defining discrete workloads so the system has clear, focused objectives.'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I architect modular workflows where AI handles parallel, optimized units of work, allowing me to innovate on independent parts of the solution simultaneously.'
            }
        ],
        weight: 1.0
    },
    {
        id: 'q4',
        text: 'Platform Awareness: When working with AI, I can select the right tool or model based on its specific strengths to solve the problem at hand.',
        category: 'Delegation',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I am not yet familiar with the specific AI tools available; I use whichever tool is most convenient without knowing its technical limitations or approval status.'
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
        text: 'Product Description: As a leader, I can describe the desired product or output in a way that minimizes or eliminates ambiguity.',
        category: 'Communication',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I struggle to describe what a final product should look like, often providing vague or generic requests that lead to mismatched results.'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I can describe products using standard terminology, ensuring that the output meets basic departmental needs.'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I can provide detailed specifications, including format, tone, and audience to ensure that the final output is fit-for-purpose and high quality.'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I can articulate multi-dimensional requirements that go beyond the obvious, describing how an output/product should look, feel, function over time.'
            }
        ],
        weight: 1.0
    },
    {
        id: 'q6',
        text: 'Process Clarity: As a leader, I can clearly explain the how behind a task, so that it can be understood, replicated or automated.',
        category: 'Communication',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I have difficulty explaining the how and usually just ask for the result and leave the process entirely up to others.'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I can outline the standard steps for a known process, ensuring that team members follow standard operating procedures (SOPs) and stay within operational lanes.'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I can explain the logic behind each step of a process, making it easy for others to replicate the workflow and troubleshoot bottlenecks independently.'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I can design and communicate entirely new workflows from scratch, explaining how various stages of work interact and automate to increase speed.'
            }
        ],
        weight: 1.0
    },
    {
        id: 'q7',
        text: 'Performance Expectations: As a leader, I can set clear, high-quality standards that define what great looks like.',
        category: 'Communication',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I do not set performance standards, I typically realize that work is subpar once it is finished and delivered.'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I set expectations on a binary pass/fail criteria or deadline, ensuring the bar for the function is met.'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I provide clear benchmarks for \'good\' vs \'great\', using specific examples to illustrate the nuances of high performance.'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I articulate aspirational standards that push the boundaries of current capabilities, defining success as \'exceptional quality\' vs \'meeting specs\'.'
            }
        ],
        weight: 1.0
    },
    {
        id: 'q8',
        text: 'Context Aggregation: As a leader, I can provide comprehensive context that enables others to make well-informed decisions.',
        category: 'Communication',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I provide information as needed, assuming that others have the context they need without me explaining "the big picture".'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I provide the necessary background information for a specific task, ensuring that my team has the basic facts required to stay compliant with the objective.'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I synthesize relevant data, history and external factors into cohesive briefs, ensuring that all participants understand the why behind the what.'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I can pull disparate threads of institutional and market knowledge together to provide a 360-view of a situation, enabling others to make autonomous, well-informed decisions.'
            }
        ],
        weight: 1.0
    },
    // Section 3: Discernment
    {
        id: 'q9',
        text: 'Domain/Craft Expertise: As a leader, I have a deep understanding of the best practices, standards and strategies of the domain and craft that my team works on.',
        category: 'Discernment',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'My strength as a leader relies mostly on my leadership experience, and I typically rely on experts within my team to help establish and articulate best practices.'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I have a solid grasp of the standard techniques, operating procedures and benchmarks required for my team to function effectively and safely.'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I stay current with evolving standards and strategies in my field, enabling me to provide informed guidance and identify when work areas meet professional quality standards.'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I am an expert in my craft, capable of delivering and defining new standards and strategies that push the domain forward and create competitive advantage for the organisation.'
            }
        ],
        weight: 1.0
    },
    {
        id: 'q10',
        text: 'Logic and Reasoning: As a leader, I can evaluate the \'thinking\' behind a plan or argument to ensure it is sound, and free of bias.',
        category: 'Discernment',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I focus mostly on the final recommendation rather than how my team gets there, sometimes missing gaps in their underlying approach or reasoning.'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I follow standard, logical frameworks to see if a plan makes sense and aligns to our basic operational processes and procedures.'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I deconstruct a strategies to find logical gaps or hidden assumptions, ensuring that the path to a solution is robust and defensible.'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I regularly stress-test complex reasoning from multiple viewpoints, identifying potential biases or systemic flaws before they can impact the final outcome.'
            }
        ],
        weight: 1.0
    },
    {
        id: 'q11',
        text: 'Coaching for Improvement: As a leader, I can distinguish between \'average\' work and \'best-in-class\' with a critical eye and provide specific, actionable feedback on how to bridge the gap.',
        category: 'Discernment',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I rely mostly on my gut for whether or not something is meeting expectations and delivering on what was promised. Feedback focuses on what is wrong with the current state.'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I identify when the deliverable meets minimum required standards and can point out errors that prevent it from being acceptable.'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I clearly define the difference between \'pass\' and \'high-quality\' output, providing specific guidance on how to refine the logic or output of the final deliverable.'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I envision how \'good\' work can be transformed into \'industry-leading\' work, and provide high-level, strategic feedback that pushes the team to innovate beyond the original brief.'
            }
        ],
        weight: 1.0
    },
    // Section 4: Keeping it Twilio
    {
        id: 'q12',
        text: 'Data Stewardship: As a leader, I am vigilant about the data my team shares with AI systems and ensure we protect proprietary and sensitive information.',
        category: 'Keeping It Twilio',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I am unfamiliar with my company\'s AI usage policies.'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I follow established corporate data policies and ensure that my team only uses approved platforms and tools for departmental work.'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'My function has established a clear \'human-in-the-loop\' approach to how we leverage AI, ensuring that a person is always accountable for the final verification.'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I model accountability, creating a culture where AI is seen as an extension of the team\'s capabilities, and errors are used as transparent learning opportunities to refine our systems.'
            }
        ],
        weight: 1.0
    },
    {
        id: 'q13',
        text: 'Bias & Fairness Awareness: As a leader, I am conscious of the potential for AI to reinforce biases and actively work to ensure fair and equitable outcomes.',
        category: 'Keeping It Twilio',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I am unaware of how AI training affects its ability to introduce or reinforce bias.'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I am knowledgeable about our company\'s diversity and inclusion guidelines and leverage that knowledge to review AI work to ensure that there are no issues.'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I actively look for \'blind-spots\' in AI prompt and outputs and encourage my team to challenge AI-generated logic that appears skewed or one-sided.'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I strategically use AI to uncover bias, including my own and leverage the technology to ensure that our strategies meet the company\'s D&I expectations. My prompts are specific and intentional to mitigate these risks.'
            }
        ],
        weight: 1.0
    },
    {
        id: 'q14',
        text: 'AI Literacy: As a leader, I understand the relevant technical details of how AI systems are created and operate.',
        category: 'Keeping It Twilio',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'AI systems operate like a \'black-box\' and I do not understand the underlying technology, making it difficult for me to understand or anticipate why the system might not deliver the result I\'m expecting.'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I have a basic understanding of what AI systems can do, based on training that has been provided to me, or information I have found independently.'
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
    },
    {
        id: 'q15',
        text: 'Twilio Magic: As a leader, I ensure that AI use aligns with Twilio\'s values, culture, and the principles that make us unique.',
        category: 'Keeping It Twilio',
        type: 'maturity',
        options: [
            { 
                value: 1, 
                label: 'Not Started',
                description: 'I am not yet familiar with how Twilio\'s values and culture should influence AI use in my function.'
            },
            { 
                value: 2, 
                label: 'Compliant',
                description: 'I ensure AI use follows Twilio\'s established policies and guidelines, maintaining alignment with our core values and brand standards.'
            },
            { 
                value: 3, 
                label: 'Competent',
                description: 'I actively integrate Twilio\'s values into AI workflows, ensuring that our AI-assisted work reflects our culture and maintains the trust of our customers and stakeholders.'
            },
            { 
                value: 4, 
                label: 'Creative',
                description: 'I leverage AI to amplify Twilio\'s unique strengths and values, creating innovative solutions that embody our culture and set new standards for responsible AI use in our industry.'
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
}

/**
 * Theme Toggle - Dark/Light Mode
 * Persists user preference in localStorage
 */
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Set initial theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

/**
 * Start Assessment
 * Transitions from welcome screen to questionnaire
 */
function startAssessment() {
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
    
    // Set question text and subcategory
    questionTextEl.textContent = mainQuestion;
    questionSubcategoryEl.textContent = subcategory;
    
    // Clear previous options
    answerOptionsEl.innerHTML = '';
    
    // Randomize answer options order
    const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
    
    // Render answer options with maturity level descriptions
    shuffledOptions.forEach(option => {
        const optionEl = document.createElement('button');
        optionEl.className = 'answer-option';
        optionEl.type = 'button';
        optionEl.dataset.value = option.value;
        
        // Check if this option is already selected
        if (state.answers[question.id] === option.value) {
            optionEl.classList.add('answer-option--selected');
        }
        
        optionEl.innerHTML = `
            <div class="answer-option__description">${option.description}</div>
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
    
    // Update UI to show selected answer
    const options = document.querySelectorAll('.answer-option');
    options.forEach(option => {
        option.classList.remove('answer-option--selected');
        const optionValue = parseInt(option.dataset.value);
        if (optionValue === value) {
            option.classList.add('answer-option--selected');
        }
    });
    
    // Hide hint after selection
    updateDoubleClickHint();
    
    updateNavigation();
}

/**
 * Update Double-click Hint Visibility
 * Shows hint on first 3 questions if no answer selected
 */
function updateDoubleClickHint() {
    const hintEl = document.getElementById('double-click-hint');
    const currentQuestion = state.questions[state.currentQuestionIndex];
    const hasAnswer = state.answers[currentQuestion.id] !== undefined;
    
    // Show hint on first 3 questions if no answer selected yet
    if (hasAnswer || state.currentQuestionIndex >= 3) {
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
    const progress = ((questionIndexInSection + 1) / sectionQuestions.length) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    
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
        const nextQuestion = state.questions[state.currentQuestionIndex + 1];
        
        // Check if we're moving to a new section
        if (currentQuestion.category !== nextQuestion.category) {
            state.currentSection++;
            // Show section transition (optional: could add animation here)
        }
        
        state.currentQuestionIndex++;
        renderQuestion();
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
        const prevQuestion = state.questions[state.currentQuestionIndex - 1];
        
        // Check if we're moving to a previous section
        if (currentQuestion.category !== prevQuestion.category) {
            state.currentSection--;
        }
        
        state.currentQuestionIndex--;
        renderQuestion();
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
 * Submit Assessment
 * Calculates scores and displays results
 */
function submitAssessment() {
    const scores = calculateScores();
    const recommendations = generateRecommendations(scores);
    
    // Render results
    renderResults(scores, recommendations);
    
    // Show results screen
    showScreen('results-screen');
}

/**
 * Render Results
 * Displays overall score with combined category scores and recommendations
 * @param {Object} scores - Calculated scores
 * @param {Array} recommendations - Generated recommendations
 */
function renderResults(scores, recommendations) {
    // Overall score
    const overallScoreEl = document.getElementById('overall-score');
    overallScoreEl.textContent = scores.overallMaturity;
    overallScoreEl.style.fontSize = '2rem';
    
    // Add overall score description
    const overallScoreContainer = overallScoreEl.parentElement;
    const existingDesc = overallScoreContainer.querySelector('.score-card__description');
    if (existingDesc) {
        existingDesc.remove();
    }
    const descEl = document.createElement('div');
    descEl.className = 'score-card__description';
    descEl.textContent = `Average maturity level: ${scores.overall.toFixed(2)}`;
    overallScoreContainer.appendChild(descEl);
    
    // Combined results (category score + recommendation together)
    const combinedResultsEl = document.getElementById('combined-results');
    combinedResultsEl.innerHTML = '';
    
    state.categories.forEach(category => {
        const avgScore = scores.categories[category.name] || 0;
        const maturity = scores.categoryMaturities[category.name] || 'Not Started';
        const level = maturityLevels.find(l => l.label === maturity);
        const levelColor = level ? level.color : 'var(--color-neutral-600)';
        
        // Find the recommendation for this category
        const rec = recommendations.find(r => r.category === category.name);
        
        const combinedEl = document.createElement('div');
        combinedEl.className = 'combined-result';
        combinedEl.innerHTML = `
            <div class="combined-result__header">
                <div class="combined-result__score">
                    <span class="combined-result__name">${category.name}</span>
                    <span class="combined-result__maturity" style="color: ${levelColor}">${maturity}</span>
                </div>
                <span class="combined-result__value">${avgScore.toFixed(2)}</span>
            </div>
            <div class="combined-result__bar">
                <div class="combined-result__fill" style="width: ${(avgScore / 4) * 100}%; background-color: ${levelColor}"></div>
            </div>
            <div class="combined-result__recommendation">
                <p>${rec ? rec.text : ''}</p>
            </div>
        `;
        combinedResultsEl.appendChild(combinedEl);
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
    showScreen('welcome-screen');
}

/**
 * Print Report
 * Triggers browser print dialog for PDF export
 */
function printReport() {
    window.print();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
