import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import OpenAI from 'openai'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      {
        name: 'configure-server',
        configureServer(server) {
          server.middlewares.use('/api/chat', async (req, res, next) => {
            if (req.method !== 'POST') {
              res.statusCode = 405
              res.end('Method Not Allowed')
              return
            }

            // Simple body parser
            const buffers = []
            for await (const chunk of req) {
              buffers.push(chunk)
            }
            const data = Buffer.concat(buffers).toString()

            try {
              const { messages } = JSON.parse(data || '{}')

              // Check for API Key
              if (!env.OPENAI_API_KEY) {
                console.error("Missing OPENAI_API_KEY in .env file")
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                // Return a structure that ChatBot.jsx expects
                res.end(JSON.stringify({ error: 'Missing OPENAI_API_KEY in .env file' }))
                return
              }

              const openai = new OpenAI({
                apiKey: env.OPENAI_API_KEY,
              })

              const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                  {
                    role: 'system',
                    content: 'You are a knowledgeable and friendly travel assistant specializing in Mysuru (Mysore), India. Help users discover hidden gems, local culture, authentic food experiences, heritage sites, and travel tips. Be concise, enthusiastic, and provide specific recommendations when possible.'
                  },
                  ...(messages || [])
                ],
                temperature: 0.7,
                max_tokens: 500,
              })

              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({
                message: completion.choices[0].message.content,
                usage: completion.usage,
              }))

            } catch (error) {
              console.error('API Error:', error)
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: error.message || 'Internal Server Error' }))
            }
          })
        }
      }
    ],
  }
})
