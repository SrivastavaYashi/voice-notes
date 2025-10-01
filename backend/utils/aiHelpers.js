const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


// No need for transcription function - it's done in browser!
// We just receive the transcript from frontend

// Real AI Summarization with Gemini
async function generateSummary(text) {
  try {
    console.log('🤖 Gemini AI: Generating summary...');
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001"});
    
    const prompt = `Please provide a concise 2-3 sentence summary of the following voice note text. Focus on the main points and key ideas:\n\n${text.substring(0, 3000)}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();
    
    console.log('✅ Gemini summary completed');
    return summary;
  } catch (error) {
    console.error('Gemini API Error:', error);
    return `Summary: ${text.split('.')[0]}. [Gemini AI error: ${error.message}]`;
  }
}


module.exports = { generateSummary };