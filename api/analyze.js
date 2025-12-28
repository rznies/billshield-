export const config = {
    runtime: 'edge',
};

const JSON_SCHEMA = `{
  "subscriptions": [
    {
      "merchant": "string (e.g., Netflix, Spotify)",
      "currency": "INR",
      "monthly_cost": "number",
      "billing_cycle": "monthly | quarterly | yearly",
      "annual_cost": "number",
      "confidence": "high | medium | low",
      "unused_flag": "boolean",
      "unused_reason": "string (empty if not unused)",
      "cancellation_steps": ["step 1", "step 2", "..."]
    }
  ],
  "total_annual_spend": "number",
  "potential_savings": "number"
}`;

const SYSTEM_PROMPT = `You are a financial analyst AI specializing in subscription detection from Indian bank statements.

Your task is to analyze transaction data and identify recurring subscription charges.

RULES:
1. Only identify REAL subscriptions visible in the data. Do NOT hallucinate merchants.
2. Group similar merchant names (e.g., "NETFLIX.COM" and "Netflix" are the same).
3. Detect billing cycles: monthly, quarterly, or yearly.
4. Calculate monthly_cost and annual_cost for each subscription.
5. Flag AT LEAST ONE subscription as "possibly unused" with unused_flag: true.
6. Provide generic cancellation steps for each subscription.
7. Use CONSERVATIVE language for unused flags (e.g., "May no longer be needed", "No recent usage detected").
8. Currency is always INR (₹).
9. Return ONLY valid JSON. No markdown, no explanations, no text outside the JSON.

JSON OUTPUT SCHEMA:
${JSON_SCHEMA}

IMPORTANT: Your response must be ONLY the JSON object. Nothing else.`;

export default async function handler(request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    }

    if (request.method !== 'POST') {
        return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
        return Response.json(
            { error: 'GEMINI_API_KEY environment variable is not set. Please add it in Vercel Dashboard > Settings > Environment Variables.' },
            { status: 500 }
        );
    }

    try {
        const body = await request.json();
        const { input, inputType } = body;

        if (!input) {
            return Response.json({ error: 'Input is required' }, { status: 400 });
        }

        // Build request for Gemini API
        let parts;
        if (inputType === 'pdf') {
            parts = [
                {
                    inline_data: {
                        mime_type: "application/pdf",
                        data: input
                    }
                },
                {
                    text: `${SYSTEM_PROMPT}\n\nTASK: Analyze the bank statement PDF. 1. Extract every transaction. 2. Identify recurring subscriptions. 3. STRICTLY SUM the annual costs of all found subscriptions to calculate total_annual_spend. Do not estimate.`
                }
            ];
        } else {
            parts = [
                {
                    text: `${SYSTEM_PROMPT}\n\nTASK: Analyze these transactions. 1. Identify recurring subscriptions. 2. CALCULATE: annual_cost = monthly_cost * 12. 3. SUM all annual_costs to get total_annual_spend.\n\nTransactions:\n${input}`
                }
            ];
        }

        // Call Gemini API directly via REST
        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{ parts }],
                    generationConfig: {
                        temperature: 0,
                        responseMimeType: "application/json",
                    }
                }),
            }
        );

        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text();
            console.error('Gemini API error:', errorText);
            return Response.json(
                { error: 'Gemini API error', details: errorText },
                { status: 500 }
            );
        }

        const geminiData = await geminiResponse.json();
        
        // Extract the text from Gemini response
        const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!text) {
            return Response.json(
                { error: 'No response from Gemini API', details: JSON.stringify(geminiData) },
                { status: 500 }
            );
        }

        // Parse the JSON response
        const parsed = JSON.parse(text);

        return Response.json(parsed, {
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        });

    } catch (error) {
        console.error('API Error:', error);
        return Response.json(
            { error: 'Failed to analyze subscriptions', details: error.message },
            { status: 500 }
        );
    }
}
