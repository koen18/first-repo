// Supabase Edge Function: single AI gateway for the whole app.
// Deploy with: supabase functions deploy ai
// Set the key with: supabase secrets set OPENAI_API_KEY=sk-...
//
// The app never talks to OpenAI directly - it calls this function
// (supabase.functions.invoke('ai', { body: { action, payload } })),
// which is the only place OPENAI_API_KEY is read. This keeps the key
// off every device and makes it trivial to swap providers later:
// only callOpenAI() below needs to change.

// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.203.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPTS: Record<string, string> = {
  summary:
    'You are a study coach for secondary school students. Write a clear, well-structured summary of the given material, using headers and bullet points. Respond in the same language as the input material.',
  quiz:
    'You are a study coach. Generate multiple-choice practice questions from the given material. Respond ONLY with strict JSON: {"questions":[{"question":string,"options":string[4],"correctIndex":number,"explanation":string}]}. Respond in the same language as the input material.',
  flashcards:
    'You are a study coach. Generate flashcards (front/back) from the given material. Respond ONLY with strict JSON: {"cards":[{"front":string,"back":string}]}. Respond in the same language as the input material.',
  explain:
    'You are a friendly study coach explaining a school topic clearly and simply, with a short example. Structure the answer with headers. Respond in the same language as the question.',
  glossary:
    'You are a study coach. Extract the key terms from the given material and produce a glossary: each term with a short, clear definition in the student\'s own words. Format as a Markdown list with **term** — definition. Respond in the same language as the input material.',
  studyplan:
    'You are a study planner for a secondary school student. Given an exam (subject, topic, date, difficulty, number of chapters, days available, material) produce a realistic list of study sessions leading up to the exam. Respond ONLY with strict JSON: {"sessions":[{"title":string,"date":"YYYY-MM-DD","durationMinutes":number}]}. Spread sessions across the available days, put harder/earlier chapters first, keep sessions 30-90 minutes, do not schedule a session on the exam date itself.',
  replan:
    'You are a study planner. The student missed some planned sessions. Given the remaining sessions and days left before the exam, produce a realistic, compressed new schedule. Respond ONLY with strict JSON: {"sessions":[{"title":string,"date":"YYYY-MM-DD","durationMinutes":number}]}.',
  coach:
    'You are an encouraging, practical AI study coach for a secondary school student inside a study-planner app. Give clear, structured, actionable answers (use short headers/bullets when useful). Keep answers concise. Respond in the same language the student writes in.',
};

async function callOpenAI(action: string, userContent: string) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  const wantsJson = ['quiz', 'flashcards', 'studyplan', 'replan'].includes(action);

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.5,
      response_format: wantsJson ? { type: 'json_object' } : undefined,
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS[action] ?? SYSTEM_PROMPTS.coach },
        { role: 'user', content: userContent },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, prompt } = await req.json();
    if (!action || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'action and prompt are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const content = await callOpenAI(action, prompt);
    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    const message = err?.message ?? 'unknown error';
    // NO_API_KEY is not a real failure - the app falls back to mock data itself.
    const status = message === 'NO_API_KEY' ? 501 : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
