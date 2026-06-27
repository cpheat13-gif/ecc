import { getAnthropicClient } from '@/lib/ai/client'

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json()

    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured. Add it to .env.local.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      )
    }

    const systemPrompt = `You are a helpful financial assistant for ${context?.coupleName ?? 'a couple'} managing their joint finances.

Today's date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

## Their Financial Setup

### Monthly Vault Goals
${context?.vaults?.map((v: { name: string; goal_amount: number }) => `- ${v.name}: $${v.goal_amount.toLocaleString()}`).join('\n') ?? 'Not provided'}

### Total Monthly Income: $${context?.totalMonthlyIncome?.toLocaleString() ?? 'Unknown'}

### Members
${context?.members?.map((m: { display_name: string; avg_paycheck: number; annual_income: number }) =>
  `- ${m.display_name}: $${m.avg_paycheck.toLocaleString()}/paycheck · $${m.annual_income.toLocaleString()} annual`
).join('\n') ?? 'Not provided'}

### Monthly Fixed Expenses
${context?.fixedItems?.map((i: { name: string; planned_amount: number }) => `- ${i.name}: $${i.planned_amount.toLocaleString()}`).join('\n') ?? 'Not provided'}

### Subscriptions
${context?.subscriptions?.map((s: { name: string; amount: number }) => `- ${s.name}: $${s.amount.toLocaleString()}`).join('\n') ?? 'Not provided'}

## Guidelines
- Base answers on their actual numbers above
- Format currency as $X,XXX
- Be concise, warm, and practical
- When they ask about changes to numbers, explain the ripple effect
- If asked to calculate something not in the data, do your best with what's given`

    const anthropic = getAnthropicClient()
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`))
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
