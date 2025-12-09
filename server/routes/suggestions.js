const express = require('express');
const { getDb } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// Get smart suggestions based on home type
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const userId = req.user.id;

    // Get user's home type
    const result = await db.query('SELECT home_type FROM users WHERE id = $1', [userId]);

    const homeType = result.rows[0]?.home_type || 'house';
    const suggestions = getSuggestionsForHomeType(homeType);
    
    res.json({ suggestions });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

function getSuggestionsForHomeType(homeType) {
  const baseSuggestions = [
    {
      title: 'Replace Air Filter',
      description: 'Replace HVAC air filter to maintain air quality and system efficiency',
      category: 'HVAC',
      frequency_days: 90,
      priority: 'high'
    },
    {
      title: 'Test Smoke Alarms',
      description: 'Test all smoke alarms and replace batteries if needed',
      category: 'Safety',
      frequency_days: 30,
      priority: 'high'
    },
    {
      title: 'Check Carbon Monoxide Detector',
      description: 'Test carbon monoxide detector and replace batteries',
      category: 'Safety',
      frequency_days: 30,
      priority: 'high'
    },
    {
      title: 'Clean Gutters',
      description: 'Remove debris from gutters and downspouts',
      category: 'Exterior',
      frequency_days: 90,
      priority: 'medium'
    },
    {
      title: 'Inspect Water Heater',
      description: 'Check for leaks and drain sediment from water heater',
      category: 'Plumbing',
      frequency_days: 180,
      priority: 'medium'
    },
    {
      title: 'Service HVAC System',
      description: 'Schedule professional HVAC maintenance',
      category: 'HVAC',
      frequency_days: 180,
      priority: 'medium'
    },
    {
      title: 'Check for Leaks',
      description: 'Inspect pipes, faucets, and appliances for leaks',
      category: 'Plumbing',
      frequency_days: 30,
      priority: 'medium'
    },
    {
      title: 'Clean Dryer Vent',
      description: 'Clean lint from dryer vent to prevent fire hazard',
      category: 'Appliances',
      frequency_days: 90,
      priority: 'high'
    },
    {
      title: 'Inspect Roof',
      description: 'Check roof for damaged shingles or leaks',
      category: 'Exterior',
      frequency_days: 180,
      priority: 'medium'
    },
    {
      title: 'Test Garage Door',
      description: 'Test garage door safety features and lubrication',
      category: 'Exterior',
      frequency_days: 90,
      priority: 'low'
    }
  ];

  // Apartment-specific suggestions (fewer exterior tasks)
  if (homeType === 'apartment' || homeType === 'condo') {
    return baseSuggestions.filter(s => 
      !['Clean Gutters', 'Inspect Roof', 'Test Garage Door'].includes(s.title)
    );
  }

  return baseSuggestions;
}

module.exports = router;
