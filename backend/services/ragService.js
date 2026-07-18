const fs = require('fs');
const path = require('path');
const axios = require('axios');

const VECTOR_STORE_PATH = path.join(__dirname, '../data/vector_store.json');

// Ensure data directory and file exist
const initStore = () => {
  const dir = path.dirname(VECTOR_STORE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(VECTOR_STORE_PATH)) {
    fs.writeFileSync(VECTOR_STORE_PATH, JSON.stringify([]));
  }
};

const getEmbeddings = async (text) => {
  const apiKey = process.env.GEMINI_API_KEY;
  // Gemini text embedding URL format
  const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;
  
  try {
    const response = await axios.post(url, {
      model: "models/text-embedding-004",
      content: { parts: [{ text }] }
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    return response.data.embedding.values;
  } catch (error) {
    console.error("Error generating embedding:", error.response?.data || error.message);
    throw new Error("Failed to generate embedding");
  }
};

const cosineSimilarity = (vecA, vecB) => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

const chunkText = (text, maxLength = 500) => {
  const chunks = [];
  const sentences = text.split(/(?<=[.?!])\s+/);
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk.length + sentence.length) > maxLength && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = "";
    }
    currentChunk += sentence + " ";
  }
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  return chunks;
};

exports.addDocument = async (text, metadata = {}) => {
  initStore();
  const chunks = chunkText(text);
  const store = JSON.parse(fs.readFileSync(VECTOR_STORE_PATH, 'utf-8'));

  for (const chunk of chunks) {
    const embedding = await getEmbeddings(chunk);
    store.push({
      id: Date.now().toString() + Math.random().toString(36).substring(7),
      text: chunk,
      embedding,
      metadata: { ...metadata, ingestedAt: new Date().toISOString() }
    });
  }

  fs.writeFileSync(VECTOR_STORE_PATH, JSON.stringify(store, null, 2));
  return chunks.length;
};

exports.searchRelevantContext = async (query, topK = 3) => {
  initStore();
  const store = JSON.parse(fs.readFileSync(VECTOR_STORE_PATH, 'utf-8'));
  if (store.length === 0) return "";

  const queryEmbedding = await getEmbeddings(query);
  
  const results = store.map(doc => ({
    ...doc,
    similarity: cosineSimilarity(queryEmbedding, doc.embedding)
  }));

  results.sort((a, b) => b.similarity - a.similarity);
  
  // Return the top K results as a concatenated string
  const topResults = results.slice(0, topK);
  return topResults.map(r => r.text).join('\n\n');
};
