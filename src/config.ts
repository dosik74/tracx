const GROQ_MODEL = 'openai/gpt-oss-20b';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY ?? '';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';

export { GROQ_API_KEY, GROQ_MODEL, GROQ_URL, SUPABASE_URL, SUPABASE_KEY };

