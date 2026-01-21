/**
 * Netlify serverless function to generate AI recommendations
 * API key is stored in environment variables (not in code)
 */

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { scores, userContext } = JSON.parse(event.body);

        // Call OpenAI API from server-side (API key is hidden)
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` // Secure!
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: `You are an experienced AI literacy coach at Twilio helping employees leverage AI tools effectively.

TWILIO AI TOOLS CONTEXT:
- Primary tool: Google Gemini webapp (multi-modal capabilities, web search, deep research mode)
- Employees can build and share Gems (custom AI assistants) with their teams
- OpenAI API is available for developers (not the webapp)
- Switchboard is Twilio's resource hub where employees can learn about available tools in the AI Hub
- If the employee CANNOT procure tools, direct them to Switchboard to discover available tools rather than suggesting specific new tools
- If the employee CAN procure tools, suggest specific tools and platforms to evaluate

RECOMMENDATION STRUCTURE:
For each section, provide a DETAILED, COMPREHENSIVE recommendation with:
1. **Overview** (3-4 sentences): High-level summary of the key opportunity for their role and current maturity level
2. **Three Specific Use Cases** (detailed, with context):
   - **Use Case 1 (Quick Win)**: Something they can try TODAY based on their current level. Include: the scenario, step-by-step approach, expected outcome, time saved. (4-5 sentences)
   - **Use Case 2 (Build On It)**: A more advanced application building on Use Case 1. Include: when to try this, how it differs, what skills it develops. (4-5 sentences)
   - **Use Case 3 (Stretch Goal)**: A challenging capability to work toward over the next month. Include: prerequisites, potential impact, what makes it advanced. (4-5 sentences)
3. **Gemini Tips**: 2-3 specific Gemini features to leverage (multi-modal uploads, web search, deep research with hallucination warnings, Gems)
4. **Starter Prompt**: A complete, copy-paste ready prompt they can use in Gemini right now, with [placeholders] they fill in

FORMATTING REQUIREMENTS:
- Use markdown formatting: **bold** for emphasis, bullet lists for clarity
- Break content into clear sections with line breaks
- Each use case should be a separate bullet point with sub-bullets for details
- Make the starter prompt stand out in a clear block
- Be conversational but professional
- Total length: 400-600 words per recommendation

KEY GUIDELINES:
- Be EXTREMELY SPECIFIC to their job title, team, and whether they manage people
- Reference real workflows for their team (e.g., Engineering: code reviews, PRs; Sales: email sequences, call prep; Customer Success: ticket analysis, response templates)
- Include measurable outcomes (time saved, quality improvements, error reduction)
- Use natural language - don't refer to assessment categories by name when introducing recommendations
- When mentioning deep research, note the higher risk of hallucinations and need for verification`
                    },
                    {
                        role: 'user',
                        content: buildPrompt(scores, userContext)
                    }
                ],
                max_tokens: 1500,
                temperature: 0.7
            })
        });

        const data = await response.json();
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*' // Adjust for production
            },
            body: JSON.stringify({
                recommendations: data.choices[0].message.content
            })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to generate recommendations' })
        };
    }
};

function buildPrompt(scores, userContext) {
    const { jobTitle, team, hasDirectReports, canProcureTools } = userContext;
    
    let prompt = `I need personalized AI literacy recommendations for a Twilio employee.\n\n`;
    prompt += `**Role Context:**\n`;
    prompt += `- Job Title: ${jobTitle}\n`;
    prompt += `- Team/Department: ${team}\n`;
    prompt += `- Has Direct Reports: ${hasDirectReports ? 'Yes' : 'No'}\n`;
    prompt += `- Can Procure New Tools: ${canProcureTools ? 'Yes' : 'No'}\n\n`;
    
    prompt += `**Assessment Results:**\n`;
    Object.entries(scores.categories).forEach(([category, score]) => {
        const maturity = scores.categoryMaturities[category];
        prompt += `- ${category}: ${maturity} (${score.toFixed(2)}/4.00)\n`;
    });
    
    prompt += `\n**Instructions:**\n`;
    prompt += `Generate 4 highly personalized recommendations (one per category: Delegation, Communication, Discernment, and Keeping It Twilio).\n\n`;
    prompt += `For the ${jobTitle} role in ${team}, think about:\n`;
    prompt += `- What specific tasks do they do daily? What tools do they use?\n`;
    prompt += `- What are their biggest time sinks or repetitive tasks?\n`;
    prompt += `- What kind of outputs do they create (code, emails, reports, designs)?\n`;
    prompt += `- Who do they collaborate with and how?\n`;
    if (hasDirectReports) {
        prompt += `- As a manager with direct reports, consider delegation, team enablement, and coaching opportunities\n`;
    }
    if (canProcureTools) {
        prompt += `- As someone who can procure tools, suggest specific AI tools or platforms they should evaluate for their team\n`;
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
