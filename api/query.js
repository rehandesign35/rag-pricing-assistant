require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { answerQuestion } = require('./answer');

function makeSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  }
  return createClient(url, key);
}

function getClientIp(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  const firstForwarded = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : String(forwardedFor || '').split(',')[0];
  const ip = (firstForwarded || req.socket?.remoteAddress || '').trim();
  return ip.replace(/^::ffff:/, '') || 'unknown';
}

function getQuestionFromBody(body) {
  if (!body) {
    return '';
  }

  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body);
      return parsed?.question || '';
    } catch {
      return '';
    }
  }

  return body.question || '';
}

async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'method_not_allowed' });
      return;
    }

    const question = String(getQuestionFromBody(req.body) || '').trim();
    if (!question || question.length > 500) {
      res.status(400).json({ error: 'invalid_question' });
      return;
    }

    const supabase = makeSupabaseClient();
    const ip = getClientIp(req);
    const windowStart = new Date(Date.now() - 60 * 1000).toISOString();

    const { count, error: countError } = await supabase
      .from('rate_limits')
      .select('id', { count: 'exact', head: true })
      .eq('ip', ip)
      .gt('created_at', windowStart);

    if (countError) {
      throw countError;
    }

    if ((count || 0) >= 5) {
      res.status(429).json({
        error: 'rate_limited',
        message: "You're sending messages too fast - please wait a moment.",
      });
      return;
    }

    const { error: insertError } = await supabase.from('rate_limits').insert({ ip });
    if (insertError) {
      throw insertError;
    }

    const result = await answerQuestion(question);

    res.status(200).json({
      answer: result.answer,
      refused: result.refused,
      citedSources: result.citedSources,
    });
  } catch (error) {
    console.error('query handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'internal_error' });
    }
  }
}

module.exports = handler;
