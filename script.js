// Mock data for activities
const mockActivities = [
  {
    id: 1,
    title: "Seattle Children's Museum",
    description: "Interactive exhibits perfect for curious minds aged 6-10. Features hands-on science experiments, art studios, and imaginative play areas. Located in the heart of Seattle Center, just 8 miles from downtown. Open weekends 10am-5pm with $15 admission."
  },
  {
    id: 2,
    title: "Discovery Park Adventure Trail",
    description: "Family-friendly hiking trails with stunning Puget Sound views. The easy 2-mile loop trail is perfect for kids who love nature and wildlife spotting. Free parking and admission, just 12 miles north. Great for Saturday afternoon adventures with picnic areas available."
  },
  {
    id: 3,
    title: "Woodland Park Zoo Safari Experience",
    description: "Home to over 1,000 animals from around the world in naturalistic habitats. Educational keeper talks throughout the day make it engaging for school-age children. Located 10 miles from city center with $25 family passes. Perfect for weekend exploration and learning."
  },
  {
    id: 4,
    title: "Alki Beach Playground & Splash Pad",
    description: "Beach playground featuring modern equipment and a splash pad for hot days. Kids can build sandcastles while parents enjoy coffee from nearby cafes. Free public access with plenty of parking, just 15 miles west. Ideal for active families seeking outdoor fun."
  },
  {
    id: 5,
    title: "Pacific Science Center IMAX Theater",
    description: "Immersive educational films on a giant screen that captivate kids and adults alike. Current features include nature documentaries and space exploration films. Located at Seattle Center, 8 miles from downtown. Weekend shows every hour with $18 tickets including museum access."
  }
];

// DOM elements
const formView = document.getElementById('form-view');
const resultsView = document.getElementById('results-view');
const activityForm = document.getElementById('activity-form');
const submitBtn = document.getElementById('submit-btn');
const backBtn = document.getElementById('back-btn');
const recommendationsList = document.getElementById('recommendations-list');

// Form validation
function validateForm(formData) {
  const errors = {};

  if (!formData.city.trim()) {
    errors.city = 'City is required';
  }
  if (!formData.kidsAges.trim()) {
    errors.kidsAges = 'Kids ages are required';
  }
  if (!formData.availability.trim()) {
    errors.availability = 'Availability is required';
  }
  if (!formData.travelDistance.trim()) {
    errors.travelDistance = 'Travel distance is required';
  }

  return errors;
}

// Display validation errors
function displayErrors(errors) {
  // Clear all previous errors
  document.querySelectorAll('.error-message').forEach(error => {
    error.classList.remove('show');
    error.textContent = '';
  });

  document.querySelectorAll('input, textarea').forEach(input => {
    input.classList.remove('error');
  });

  // Display new errors
  Object.keys(errors).forEach(field => {
    const input = document.getElementById(field);
    const errorElement = document.getElementById(field + '-error');

    if (input && errorElement) {
      input.classList.add('error');
      errorElement.textContent = errors[field];
      errorElement.classList.add('show');
    }
  });
}

// Create recommendation card HTML
function createRecommendationCard(activity) {
  return `
    <div class="recommendation-card">
      <h3 class="recommendation-title">${activity.title}</h3>
      <p class="recommendation-description">${activity.description}</p>
    </div>
  `;
}

// Display recommendations
function displayRecommendations(activities) {
  recommendationsList.innerHTML = activities
    .map(activity => createRecommendationCard(activity))
    .join('');
}

// Show loading state
function showLoading() {
  submitBtn.disabled = true;
  submitBtn.textContent = 'Finding Activities...';
  submitBtn.classList.add('loading');
}

// Hide loading state
function hideLoading() {
  submitBtn.disabled = false;
  submitBtn.textContent = 'Find Activities';
  submitBtn.classList.remove('loading');
}

// Switch views
function showFormView() {
  formView.style.display = 'block';
  resultsView.style.display = 'none';
}

function showResultsView() {
  formView.style.display = 'none';
  resultsView.style.display = 'block';
}

// Form submission handler
activityForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  // Get form data
  const formData = {
    city: document.getElementById('city').value,
    kidsAges: document.getElementById('kidsAges').value,
    availability: document.getElementById('availability').value,
    travelDistance: document.getElementById('travelDistance').value,
    preferences: document.getElementById('preferences').value
  };

  // Validate form
  const errors = validateForm(formData);

  if (Object.keys(errors).length > 0) {
    displayErrors(errors);
    return;
  }

  // Clear any existing errors
  displayErrors({});

  // Show loading state
  showLoading();

  try {
    // Call backend API
    console.log('🚀 Calling backend API with:', formData);

    const response = await fetch('http://localhost:3001/api/activities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ API response received:', data);

    if (data.success && data.activities) {
      hideLoading();
      displayRecommendations(data.activities);
      showResultsView();
    } else {
      throw new Error('Invalid response format from API');
    }

  } catch (error) {
    console.error('❌ Error calling API:', error);
    hideLoading();

    // Show error message to user
    displayErrors({
      general: 'Unable to get recommendations. Please check your connection and try again.'
    });

    // Fallback to mock data for development
    console.log('📝 Falling back to mock data');
    displayRecommendations(mockActivities);
    showResultsView();
  }
});

// Back button handler
backBtn.addEventListener('click', function() {
  showFormView();
  activityForm.reset();
  displayErrors({});
});

// Clear errors on input
document.querySelectorAll('input, textarea').forEach(input => {
  input.addEventListener('input', function() {
    if (this.classList.contains('error')) {
      this.classList.remove('error');
      const errorElement = document.getElementById(this.id + '-error');
      if (errorElement) {
        errorElement.classList.remove('show');
        errorElement.textContent = '';
      }
    }
  });
});