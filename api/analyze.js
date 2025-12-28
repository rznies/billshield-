const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

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

module.exports = async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!genAI) {
        return res.status(500).json({ error: 'Gemini API key not configured on server. Please add GEMINI_API_KEY environment variable in Vercel.' });
    }

    const { input, inputType } = req.body;

    if (!input) {
        return res.status(400).json({ error: 'Input is required' });
    }

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                temperature: 0,
                responseMimeType: "application/json",
            }
        });

        let content;
        if (inputType === 'pdf') {
            content = [
                {
                    inlineData: {
                        mimeType: "application/pdf",
                        data: input
                    }
                },
                {
                    text: `${SYSTEM_PROMPT}\n\nTASK: Analyze the bank statement PDF. 1. Extract every transaction. 2. Identify recurring subscriptions. 3. STRICTLY SUM the annual costs of all found subscriptions to calculate total_annual_spend. Do not estimate.`
                }
            ];
        } else {
            content = `${SYSTEM_PROMPT}\n\nTASK: Analyze these transactions. 1. Identify recurring subscriptions. 2. CALCULATE: annual_cost = monthly_cost * 12. 3. SUM all annual_costs to get total_annual_spend.\n\nTransactions:\n${input}`;
        }

        const result = await model.generateContent(content);
        const response = await result.response;
        const text = response.text();
        const parsed = JSON.parse(text);

        return res.status(200).json(parsed);
    } catch (error) {
        console.error("Gemini API Error:", error);
        return res.status(500).json({ error: 'Failed to analyze subscriptions', details: error.message });
    }
};
