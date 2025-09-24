const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Validate environment variables
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY not found in environment variables');
  process.exit(1);
}

// Build prompt template function
function buildPromptFromTemplate(formData) {
  const { city, kidsAges, availability, travelDistance, preferences } = formData;

  // Use preferences or default message
  const prefs = preferences?.trim() || "No specific preferences";

  return `Please help me find family activities with these requirements:

**Location:** ${city}
**Kids' Ages:** ${kidsAges}
**When:** ${availability}
**Travel Distance:** Within ${travelDistance} miles
**Other Preferences:** ${prefs}

Using web search, find 5 current weekend family activities in or near ${city}. For each recommendation, provide:

1. **Bold Activity Title**
2. 2-4 sentences with:
   - Brief description of the activity
   - Why it's good for kids aged ${kidsAges}
   - Location/venue information
   - Any relevant timing or booking details

Focus on activities that are:
- Age-appropriate for ${kidsAges} year olds
- Available during ${availability}
- Family-friendly and engaging
- Currently operating/available

Format each recommendation clearly with bold titles.`;
}

// Generate location-aware mock data for fallback
function generateLocationAwareMockData(formData) {
  const { city, kidsAges, availability, travelDistance, preferences } = formData;

  // Base template activities that can be customized
  const templates = [
    {
      title: "Local Children's Museum",
      description: `Interactive exhibits perfect for kids aged ${kidsAges}. Features hands-on science experiments, art studios, and imaginative play areas. Located in ${city} area, within ${travelDistance} miles. Great for ${availability} with educational activities.`
    },
    {
      title: "City Park Adventure Trail",
      description: `Family-friendly trails with scenic views perfect for children aged ${kidsAges}. The easy loop trail offers nature exploration and wildlife spotting. Free admission within ${travelDistance} miles of ${city}. Ideal for ${availability} outdoor adventures.`
    },
    {
      title: "Local Zoo or Wildlife Experience",
      description: `Home to diverse animals in naturalistic habitats, educational for kids aged ${kidsAges}. Educational programs throughout the day make it engaging. Located within ${travelDistance} miles of ${city}, perfect for ${availability} family learning.`
    },
    {
      title: "Community Recreation Center",
      description: `Modern facility featuring activities for children aged ${kidsAges}. Indoor and outdoor play areas with organized activities. Located in ${city} area within ${travelDistance} miles. Great for ${availability} active family fun.`
    },
    {
      title: "Local Library or Cultural Center",
      description: `Interactive programs and events designed for kids aged ${kidsAges}. Features storytimes, maker spaces, and educational workshops. Located in ${city} within ${travelDistance} miles. Perfect for ${availability} learning and creativity.`
    }
  ];

  // Add preference-based customization if provided
  if (preferences && preferences.toLowerCase().includes('outdoor')) {
    templates[1].title = "Nature Trail & Outdoor Adventure";
    templates[3].title = "Outdoor Sports Complex";
  }

  if (preferences && preferences.toLowerCase().includes('budget')) {
    templates.forEach(activity => {
      activity.description = activity.description + " Budget-friendly with affordable admission.";
    });
  }

  // Handle teenager-specific requests
  if (preferences && preferences.toLowerCase().includes('teenager')) {
    return [
      {
        title: "Escape Room Challenge",
        description: `Immersive puzzle-solving experience perfect for teenagers aged ${kidsAges}. Multiple themed rooms with varying difficulty levels. Located in ${city} within ${travelDistance} miles. Great for ${availability} group activities and team building.`
      },
      {
        title: "Rock Climbing Gym or Adventure Center",
        description: `Indoor climbing walls and adventure courses designed for teens aged ${kidsAges}. Professional instruction and safety equipment provided. Located within ${travelDistance} miles of ${city}. Perfect for ${availability} active entertainment.`
      },
      {
        title: "Arcade & Entertainment Complex",
        description: `Modern gaming center with VR experiences, laser tag, and arcade games for teenagers aged ${kidsAges}. Food court and social areas available. Located in ${city} area within ${travelDistance} miles. Ideal for ${availability} social activities.`
      },
      {
        title: "Mini Golf & Go-Kart Complex",
        description: `Outdoor entertainment venue featuring mini golf and go-kart racing suitable for teens aged ${kidsAges}. Competitive activities and group packages available. Within ${travelDistance} miles of ${city}. Great for ${availability} active fun.`
      },
      {
        title: "Movie Theater & Entertainment District",
        description: `Modern cinema complex with latest releases and IMAX experiences for teenagers aged ${kidsAges}. Shopping and dining options nearby. Located in ${city} within ${travelDistance} miles. Perfect for ${availability} entertainment.`
      }
    ].map((template, index) => ({
      id: index + 1,
      title: template.title,
      description: template.description
    }));
  }

  return templates.map((template, index) => ({
    id: index + 1,
    title: template.title,
    description: template.description
  }));
}

// Parse Claude response to extract activities
function parseClaudeResponse(responseText) {
  try {
    // Split by lines and find activity titles (bold text patterns)
    const lines = responseText.split('\n');
    const activities = [];
    let currentActivity = null;

    for (let line of lines) {
      const trimmedLine = line.trim();

      // Check for bold titles (markdown **text** format)
      const boldMatch = trimmedLine.match(/\*\*(.*?)\*\*/);
      if (boldMatch && trimmedLine.length < 100) { // Title should be reasonably short
        // Save previous activity if exists
        if (currentActivity && currentActivity.description.trim()) {
          activities.push(currentActivity);
        }

        // Start new activity
        currentActivity = {
          id: activities.length + 1,
          title: boldMatch[1],
          description: ''
        };
      } else if (currentActivity && trimmedLine && !trimmedLine.match(/^\d+\./)) {
        // Add to description (avoid numbering lines)
        if (currentActivity.description) {
          currentActivity.description += ' ';
        }
        currentActivity.description += trimmedLine;
      }
    }

    // Don't forget the last activity
    if (currentActivity && currentActivity.description.trim()) {
      activities.push(currentActivity);
    }

    // Ensure we have activities, if not create a fallback
    if (activities.length === 0) {
      return [{
        id: 1,
        title: "Activity Recommendations",
        description: responseText.substring(0, 300) + "..."
      }];
    }

    // Limit to 5 activities maximum
    return activities.slice(0, 5);

  } catch (error) {
    console.error('Error parsing Claude response:', error);
    return [{
      id: 1,
      title: "Error Processing Recommendations",
      description: "We encountered an issue processing the recommendations. Please try again."
    }];
  }
}

// POST /api/activities - Get activity recommendations
router.post('/activities', async (req, res) => {
  try {
    console.log('🎯 Received activity request:', req.body);

    // Validate required fields
    const { city, kidsAges, availability, travelDistance } = req.body;

    if (!city || !kidsAges || !availability || !travelDistance) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['city', 'kidsAges', 'availability', 'travelDistance']
      });
    }

    // Build the prompt using our template
    const prompt = buildPromptFromTemplate(req.body);
    console.log('📝 Generated prompt:', prompt.substring(0, 100) + '...');

    // Call Claude API with web search tool
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 2000,
      system: "You are a family activity finder assistant. Your job is to recommend weekend activities for families based on their specific criteria. Use the web search tool to find current, real activities in their area.",
      messages: [{
        role: "user",
        content: prompt
      }],
      tools: [{
        type: "web_search_20250305",
        name: "web_search"
      }]
    });

    console.log('🤖 Claude response received');

    // Extract text content from Claude's response
    const responseText = message.content[0].text;
    console.log('📄 Response preview:', responseText.substring(0, 200) + '...');

    // Parse the response into structured activities
    const activities = parseClaudeResponse(responseText);
    console.log(`✅ Parsed ${activities.length} activities`);

    // Send structured response
    res.json({
      success: true,
      activities: activities,
      count: activities.length
    });

  } catch (error) {
    console.error('❌ Error in /api/activities:', error);

    // Check if it's a credit/billing issue or model issue and provide fallback
    if (error.message && (error.message.includes('credit balance') || error.message.includes('not_found_error'))) {
      console.log('💰 API credit issue detected, providing fallback response');

      // Generate location-aware mock data based on the request
      const mockActivities = generateLocationAwareMockData(req.body);

      res.json({
        success: true,
        activities: mockActivities,
        count: mockActivities.length,
        note: 'Demo mode: Real-time search temporarily unavailable. These are example recommendations based on your criteria.'
      });
      return;
    }

    // Send error response for other types of errors
    res.status(500).json({
      error: 'Failed to get activity recommendations',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/health - Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    anthropicConfigured: !!process.env.ANTHROPIC_API_KEY
  });
});

module.exports = router;