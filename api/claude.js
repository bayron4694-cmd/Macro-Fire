// Vercel Edge Function — proxy para Google Gemini API (gratuito)

export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  try {
    const body = await req.json()
    const { messages, max_tokens = 2000 } = body

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: { message: 'messages requerido' } }), {
        status: 400, headers: corsHeaders
      })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: { message: 'GEMINI_API_KEY no configurada' } }), {
        status: 500, headers: corsHeaders
      })
    }

    const geminiContents = messages.map(msg => {
      const parts = []
      if (typeof msg.content === 'string') {
        parts.push({ text: msg.content })
      } else if (Array.isArray(msg.content)) {
        for (const block of msg.content) {
          if (block.type === 'text') {
            parts.push({ text: block.text })
          } else if (block.type === 'image') {
            parts.push({
              inlineData: {
                mimeType: block.source.media_type,
                data: block.source.data,
              }
            })
          }
        }
      }
      return {
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts,
      }
    })

    const geminiResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: geminiContents,
          generationConfig: {
            maxOutputTokens: max_tokens,
            temperature: 0.4,
          }
        })
      }
    )

    const geminiData = await geminiResp.json()

    if (!geminiResp.ok) {
      return new Response(JSON.stringify({
        error: { message: geminiData?.error?.message || `Gemini error ${geminiResp.status}` }
      }), { status: geminiResp.status, headers: corsHeaders })
    }

    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || ''

    return new Response(JSON.stringify({
      content: [{ type: 'text', text }]
    }), { status: 200, headers: corsHeaders })

  } catch (err) {
    return new Response(JSON.stringify({
      error: { message: err.message }
    }), { status: 500, headers: corsHeaders })
  }
}
