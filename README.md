# AI Leadership Readiness Assessment Tool

A simple, self-contained web application that helps Twilio leaders assess their readiness to lead AI-enabled teams.

## Overview

This tool presents a series of questions across multiple categories (Delegation, Communication, Discernment, Keeping It Twilio), calculates scores, and generates a detailed report with recommendations.

## Features

- **Interactive Questionnaire**: Answer questions one at a time with clear navigation
- **Progress Tracking**: Visual progress indicator showing completion status
- **Category-Based Scoring**: Scores calculated per category and overall
- **Detailed Reports**: Comprehensive results with category breakdowns and recommendations
- **Print/PDF Export**: Save or print your assessment results
- **Twilio Branding**: Follows Twilio Paste design system guidelines

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- No server or build tools required

### Running the Application

1. Open `index.html` in your web browser
2. Click "Start Assessment" to begin
3. Answer all questions
4. View your results and recommendations
5. Print or save as PDF if desired

## File Structure

```
/
├── index.html          # Main application file
├── styles.css          # Styling (Twilio Paste compliant)
├── app.js              # Application logic
├── questions.js        # Question data (to be added in Milestone 2)
├── spec.md             # Project specification
├── prompt.md           # Development prompt guide
├── todo.md             # Task list for Milestone 1
└── README.md           # This file
```

## Current Status: Milestone 1

This is currently a prototype with dummy data. The UI is fully functional and follows Twilio Paste design guidelines.

### What's Included

- Complete HTML structure
- Twilio Paste-compliant styling
- Interactive questionnaire interface
- Progress tracking
- Results display with category breakdowns
- Dummy questions (8 questions across 4 categories)
- Basic scoring logic

### What's Coming in Milestone 2

- Real questions from your source document
- Actual scoring rubric and weights
- Real recommendations based on actual scoring rules

## Design System

This application follows the [Twilio Paste Design System](https://paste.twilio.design):

- **Colors**: Uses Paste design tokens for all colors
- **Typography**: Twilio Sans Display (headlines) and Twilio Sans Text (body)
- **Spacing**: Consistent spacing scale following Paste guidelines
- **Accessibility**: WCAG AA compliant

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Edge (latest)
- Safari (latest)

## Development Notes

### Milestone 1 (Current)
- UI foundation with dummy data
- Twilio branding implementation
- Basic functionality

### Milestone 2 (Next)
- Real question integration
- Actual scoring logic
- Real recommendations

### Milestone 3 (Future)
- LocalStorage persistence
- Assessment history
- Enhanced visualizations
- Final polish

## License

Internal Twilio tool.
