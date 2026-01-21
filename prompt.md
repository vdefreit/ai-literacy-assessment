# AI Leadership Readiness Assessment Tool - Prompt Guide

## Project Context
Build a simple, self-contained web application that helps company leaders assess their readiness to lead AI-enabled teams. The tool presents questions, calculates scores by category, and generates a detailed report with recommendations.

## Key Constraints
- **Simplicity First**: Start with the simplest possible solution
- **No Build Tools**: Use vanilla HTML/CSS/JavaScript, no frameworks or bundlers
- **Local First**: Single HTML file or minimal files that work offline
- **Professional**: UI must be suitable for Twilio's business leaders

## Development Approach
1. **Milestone 1**: Focus on UI/UX with dummy data - get the interface working perfectly
2. **Milestone 2**: Integrate real questions and scoring logic - replace placeholders
3. **Milestone 3**: Add persistence and export - final polish

## Data Structure Expectations

### Questions Format
```javascript
{
  id: "q1",
  text: "Question text here?",
  category: "Technical Understanding",
  type: "likert", // or "multiple-choice"
  options: [...], // for multiple choice
  weight: 1.0 // scoring weight
}
```

### Categories
- Questions will be organized into domains (Delegation, Communication, Discernment Keeping It Twilio)
- Each category will have its own score
- Overall score will be calculated from category scores

## Design Principles
- Clean, professional, corporate-friendly
- Easy to use for non-technical users
- Clear visual feedback
- Print-friendly reports

## Questions to Ask When Needed
- What are the exact question texts?
- How many questions per category?
- What is the scoring rubric (point values, weights)?
- What recommendations should appear for each score range?
- Are there any specific branding requirements?
