import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/api/predict', async (req, res) => {
  try {
    const { crop_type, land_size_hectares, start_date, location, language } = req.body;

    if (!crop_type || !land_size_hectares || !start_date) {
      return res.status(400).json({
        error: 'Missing required fields: crop_type, land_size_hectares, start_date'
      });
    }

    const mockMLResult = {
      success: true,
      prediction: {
        crop: crop_type,
        recommended_fertilizer: 'NPK 20-10-10',
        estimated_yield: `${(parseFloat(land_size_hectares) * 3.5).toFixed(2)} tons`,
        water_requirement: `${(parseFloat(land_size_hectares) * 5000).toFixed(0)} liters/day`,
        optimal_harvest_date: new Date(new Date(start_date).getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        risk_factors: ['Monitor for pests in early growth stage', 'Ensure adequate drainage'],
        success_probability: '85%',
        recommendations: [
          'Apply organic mulch to retain moisture',
          'Monitor soil pH weekly',
          'Consider drip irrigation for water efficiency'
        ]
      },
      message: `Based on your inputs for ${crop_type} cultivation on ${land_size_hectares} hectares, here are our AI-powered recommendations.`
    };

    await new Promise(resolve => setTimeout(resolve, 1500));

    res.json(mockMLResult);
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({
      error: 'Failed to generate prediction',
      details: error.message
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AGRI AI API is running' });
});

app.listen(PORT, () => {
  console.log(`AGRI AI API server running on port ${PORT}`);
});
