const axios = require('axios');
const ragService = require('../services/ragService');

// Simulated Farm Context (In a real app, this would query the DB / ThingSpeak)
const getFarmContext = () => {
  return `
Current Farm Status:
- Soil Moisture: 45.2% (Optimal is 40-60%)
- Temperature: 28.5°C
- Humidity: 65%
- Soil pH: 6.5 (Perfectly balanced)
- Nitrogen Level: 125 mg/kg (Good)
- Phosphorous Level: 45 mg/kg (Good)
- Potassium Level: 80 mg/kg (Good)

Recent Market Data (Wheat):
- Current Price: ₹2300 per quintal
- Trend: Increasing (+2% today)
- Market Forecast: Expected to rise due to international export demands.
`;
};

exports.trainData = async (req, res) => {
  try {
    const { text, metadata } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Text data is required.' });
    }
    const chunksIngested = await ragService.addDocument(text, metadata);
    res.status(200).json({ success: true, message: `Successfully ingested data into ${chunksIngested} chunks.` });
  } catch (error) {
    console.error("RAG Training Error:", error);
    res.status(500).json({ success: false, message: 'Failed to ingest training data.', error: error.message });
  }
};

exports.chat = async (req, res) => {
  try {
    const { message, language } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'Gemini API Key missing.' });
    }
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const farmContext = getFarmContext();
    const historicalContext = await ragService.searchRelevantContext(message, 3);
    
    // Construct the System Prompt
    const systemPrompt = `You are Agronix AI, a highly advanced, professional, and friendly AI Assistant built specifically for Smart Farming. 
You act as a personal agronomist, market analyst, and technical advisor for the farmer.

Here is the REAL-TIME DATA from the user's farm and local market. You MUST use this data to answer their questions accurately.

<FARM_AND_MARKET_DATA>
${farmContext}
</FARM_AND_MARKET_DATA>

${historicalContext ? `Here is some HISTORICAL DATA relevant to the user's query that you can use to provide better answers:
<HISTORICAL_DATA>
${historicalContext}
</HISTORICAL_DATA>` : ''}

CRITICAL INSTRUCTION:
The user is speaking to you in the language code: "${language || 'en'}". 
You MUST respond entirely in the appropriate language (e.g., if 'hi', respond in Hindi; if 'ta', respond in Tamil; if 'te', respond in Telugu; if 'en', respond in English).
Keep your answers concise, insightful, and formatted using Markdown (bullet points, bold text). Do not mention that you were given a context block, just naturally refer to the data.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;

    const payload = {
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: message }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      }
    };

    const response = await axios.post(url, payload, {
      headers: { 
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey 
      }
    });

    const aiMessage = response.data.candidates?.[0]?.content?.parts?.[0]?.text 
      || "I'm sorry, I couldn't generate a response for that (possible safety filter or empty response).";

    res.status(200).json({
      success: true,
      message: aiMessage
    });

  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process AI response.',
      error: error.response?.data?.error?.message || error.message
    });
  }
};
