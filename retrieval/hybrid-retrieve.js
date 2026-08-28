require('dotenv').config();
const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');

function makeOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY');
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function makeSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  }
  return createClient(url, key);
}

async function retrieveChunks(query, topK = 5) {
  const openai = makeOpenAIClient();
  const supabase = makeSupabaseClient();

  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });

  const queryEmbedding = embeddingResponse.data[0].embedding;
  const { data, error } = await supabase.rpc('hybrid_search', {
    query_embedding: queryEmbedding,
    query_text: query,
    match_count: topK,
    rrf_k: 50,
  });

  if (error) {
    throw error;
  }

  return (data || []).slice(0, topK).map((row) => ({
    content: row.content,
    source_doc: row.source_doc,
    section: row.section,
    chunk_type: row.chunk_type,
  }));
}

module.exports = { retrieveChunks };
