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

function toVectorLiteral(values) {
  return `[${values.map((value) => Number(value).toString()).join(',')}]`;
}

function parseVector(value) {
  if (Array.isArray(value)) {
    return value.map(Number);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim().replace(/^\[/, '').replace(/\]$/, '');
    if (!trimmed) {
      return [];
    }
    return trimmed.split(',').map((part) => Number(part.trim()));
  }

  return [];
}

function cosineSimilarity(left, right) {
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;
  const length = Math.min(left.length, right.length);

  for (let index = 0; index < length; index += 1) {
    const leftValue = left[index];
    const rightValue = right[index];
    dot += leftValue * rightValue;
    leftMagnitude += leftValue * leftValue;
    rightMagnitude += rightValue * rightValue;
  }

  if (!leftMagnitude || !rightMagnitude) {
    return 0;
  }

  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}

async function fetchAllChunks(supabase) {
  const pageSize = 1000;
  const rows = [];
  let page = 0;

  while (true) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    const result = await supabase
      .from('document_chunks')
      .select('content, source_doc, embedding')
      .range(from, to);

    if (result.error) {
      throw result.error;
    }

    rows.push(...(result.data || []));

    if (!result.data || result.data.length < pageSize) {
      break;
    }

    page += 1;
  }

  return rows;
}

async function retrieveChunks(query, topK = 5) {
  const openai = makeOpenAIClient();
  const supabase = makeSupabaseClient();

  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });
  const queryEmbedding = embeddingResponse.data[0].embedding;
  const queryVector = toVectorLiteral(queryEmbedding);

  const rpcResult = await supabase.rpc('match_document_chunks', {
    query_embedding: queryVector,
    match_count: topK,
  });

  if (!rpcResult.error && Array.isArray(rpcResult.data)) {
    return rpcResult.data.slice(0, topK).map((row) => ({
      content: row.content,
      source_doc: row.source_doc,
    }));
  }

  const allChunks = await fetchAllChunks(supabase);
  const scored = allChunks
    .map((row) => ({
      content: row.content,
      source_doc: row.source_doc,
      score: cosineSimilarity(queryEmbedding, parseVector(row.embedding)),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored.map(({ content, source_doc }) => ({ content, source_doc }));
}

module.exports = { retrieveChunks };
