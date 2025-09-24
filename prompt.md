# Claude API Prompt Template

## System Message
```
You are a family activity finder assistant. Your job is to recommend weekend activities for families based on their specific criteria. Use the web search tool to find current, real activities in their area.
```

## User Prompt Template

```
Please help me find family activities with these requirements:

**Location:** {city}
**Kids' Ages:** {ages}
**When:** {availability}
**Travel Distance:** Within {miles} miles
**Other Preferences:** {preferences}

Using web search, find 5 current weekend family activities in or near {city}. For each recommendation, provide:

1. **Bold Activity Title**
2. 2-4 sentences with:
   - Brief description of the activity
   - Why it's good for kids aged {ages}
   - Location/venue information
   - Any relevant timing or booking details

Focus on activities that are:
- Age-appropriate for {ages} year olds
- Available during {availability}
- Family-friendly and engaging
- Currently operating/available

Format each recommendation clearly with bold titles.
```

## Input Field Mapping

- `{city}` → User's city input
- `{ages}` → Kids' ages input
- `{availability}` → When they're free input
- `{miles}` → Travel distance input
- `{preferences}` → Other preferences input (optional, default to "No specific preferences")

## Example Filled Prompt

```
Please help me find family activities with these requirements:

**Location:** Seattle, WA
**Kids' Ages:** 7 and 10 years old
**When:** Saturday afternoon
**Travel Distance:** Within 15 miles
**Other Preferences:** Prefer outdoor activities, budget under $50 per child

Using web search, find 5 current weekend family activities in or near Seattle, WA. For each recommendation, provide:

1. **Bold Activity Title**
2. 2-4 sentences with:
   - Brief description of the activity
   - Why it's good for kids aged 7 and 10 years old
   - Location/venue information
   - Any relevant timing or booking details

Focus on activities that are:
- Age-appropriate for 7 and 10 year olds
- Available during Saturday afternoon
- Family-friendly and engaging
- Currently operating/available

Format each recommendation clearly with bold titles.
```