const fs = require('fs/promises');
const path = require('path');
require('dotenv').config();
const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');
const { chunkText, formatTableRow, parseDocument } = require('./table-chunker');

const DOCS_DIR = path.join(__dirname, '..', 'data', 'source-docs');

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

async function main() {
  const openai = makeOpenAIClient();
  const supabase = makeSupabaseClient();

  console.log('Clearing document_chunks...');
  const deleteResult = await supabase.from('document_chunks').delete().gte('id', 0);
  if (deleteResult.error) {
    throw deleteResult.error;
  }

  const files = (await fs.readdir(DOCS_DIR))
    .filter((file) => file.endsWith('.md'))
    .sort();

  console.log(`Found ${files.length} markdown source docs.`);

  let totalChunks = 0;
  let tableChunks = 0;
  let proseChunks = 0;
  const rows = [];

  for (const fileName of files) {
    const filePath = path.join(DOCS_DIR, fileName);
    const content = await fs.readFile(filePath, 'utf8');
    const segments = parseDocument(content, fileName);

    console.log(`${fileName}: ${segments.length} segments`);

    for (const segment of segments) {
      if (segment.type === 'table') {
        for (const row of segment.rows) {
          const chunk = formatTableRow(segment.section, segment.headers, row);
          const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: chunk,
          });

          const embedding = embeddingResponse.data[0].embedding;
          rows.push({
            content: chunk,
            source_doc: fileName,
            section: segment.section,
            chunk_type: 'table',
            embedding: toVectorLiteral(embedding),
          });

          totalChunks += 1;
          tableChunks += 1;
          console.log(`  embedded table row ${tableChunks}`);
        }
        continue;
      }

      const proseChunksForSegment = chunkText(segment.content);
      console.log(`  prose segment -> ${proseChunksForSegment.length} chunks`);

      for (const chunk of proseChunksForSegment) {
        const embeddingResponse = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: chunk,
        });

        const embedding = embeddingResponse.data[0].embedding;
        rows.push({
          content: chunk,
          source_doc: fileName,
          section: segment.section,
          chunk_type: 'prose',
          embedding: toVectorLiteral(embedding),
        });

        totalChunks += 1;
        proseChunks += 1;
        console.log(`  embedded prose chunk ${proseChunks}`);
      }
    }
  }

  if (rows.length > 0) {
    const insertResult = await supabase.from('document_chunks').insert(rows);
    if (insertResult.error) {
      throw insertResult.error;
    }
  }

  console.log(
    `Done. Inserted ${totalChunks} chunks total (${tableChunks} table, ${proseChunks} prose).`,
  );
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { chunkText };
