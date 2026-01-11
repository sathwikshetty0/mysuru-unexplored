import OpenAI from 'openai';

// This is a Vercel Serverless Function
// It keeps your API key secure on the server-side
export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Rate limiting check (simple implementation)
    const userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    // In production, use a proper rate limiting service like Upstash Redis

    try {
        const { messages } = req.body;

        // Validate input
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Invalid request: messages array required' });
        }

        // Limit message length to prevent abuse
        if (messages.length > 20) {
            return res.status(400).json({ error: 'Too many messages in conversation' });
        }

        // Initialize OpenAI with server-side API key
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY, // Server-side only, never exposed to client
        });

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a knowledgeable and friendly travel assistant specializing in Mysuru (Mysore), India. Help users discover hidden gems, local culture, authentic food experiences, heritage sites, and travel tips. Be concise, enthusiastic, and provide specific recommendations when possible.'
                },
                ...messages
            ],
            temperature: 0.7,
            max_tokens: 500,
        });

        // Return the response
        return res.status(200).json({
            message: completion.choices[0].message.content,
            usage: completion.usage, // Optional: track API usage
        });

    } catch (error) {
        console.error('OpenAI API Error:', error);

        // Don't expose internal error details to client
        if (error.status === 401) {
            return res.status(500).json({ error: 'API configuration error' });
        } else if (error.status === 429) {
            return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
        } else if (error.status === 400) {
            return res.status(400).json({ error: 'Invalid request to AI service' });
        }

        return res.status(500).json({ error: 'Failed to process your request' });
    }
}
