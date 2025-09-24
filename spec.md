# Family Activity Finder - Project Specification

## Requirements

### Core Features
- Parents enter 5 inputs:
  1. City location
  2. Kids' ages
  3. Available time (e.g., "Saturday afternoon")
  4. Travel distance in miles
  5. Other preferences (optional)

### Output
- 5 activity recommendations
- Each with bold title and 2-4 sentences description
- Weekend/family-focused activities

## Tech Stack

### Frontend
- React with Create React App
- CSS for styling (keep simple)
- Axios for API calls

### Backend
- Node.js with Express.js
- Claude Messages API integration
- Web search tool for real-time activity data

### APIs
- Claude Messages API (with web search tool)
- No database required (stateless)

## Design Guidelines

### UI Principles
- Clean, simple form design
- Mobile-friendly layout
- Clear typography for recommendations
- Minimal color palette

### User Experience
- Single page application
- Form → Loading → Results flow
- Error handling for API failures

## Milestones

### Milestone 1: UI Setup with Dummy Data
- Create React app structure
- Build input form with 5 fields
- Display mock activity recommendations
- Basic styling and responsive design

### Milestone 2: Claude API Integration
- Set up Express.js backend
- Implement Claude Messages API calls
- Use web search tool for current activity data
- Connect frontend to backend

### Milestone 3: Polish & Deployment
- Error handling and loading states
- Final styling touches
- Deploy to Vercel/Netlify + Railway/Heroku
- Basic testing