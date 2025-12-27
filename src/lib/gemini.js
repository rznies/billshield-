import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// JSON contract as specified in context.md
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

/**
 * Analyze subscriptions from text or PDF
 * @param {string | ArrayBuffer} input - Text content or PDF as base64
 * @param {'text' | 'pdf'} inputType - Type of input
 * @returns {Promise<Object>} Parsed subscription analysis
 */
export const analyzeSubscriptions = async (input, inputType = 'text') => {
    if (!genAI) {
        throw new Error("Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file.");
    }

    // Use generationConfig for deterministic results and strict JSON
    const model = genAI.getGenerativeModel({
        model: "gemini-3-flash-preview",
        generationConfig: {
            temperature: 0, // Force consistency (deterministic output)
            responseMimeType: "application/json", // Force valid JSON
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

    try {
        const result = await model.generateContent(content);
        const response = await result.response;
        const text = response.text();

        // With responseMimeType: "application/json", it's already clean
        const parsed = JSON.parse(text);

        // Validation... (keeping existing validation)
        if (!parsed.subscriptions || !Array.isArray(parsed.subscriptions)) {
            throw new Error("Invalid response: missing subscriptions array");
        }
        if (typeof parsed.total_annual_spend !== 'number') {
            throw new Error("Invalid response: missing total_annual_spend");
        }
        if (typeof parsed.potential_savings !== 'number') {
            throw new Error("Invalid response: missing potential_savings");
        }

        return parsed;
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        throw error;
    }
};

/**
 * Convert file to base64
 * @param {File} file - The file to convert
 * @returns {Promise<string>} Base64 encoded string
 */
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // Remove the data:application/pdf;base64, prefix
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = (error) => reject(error);
    });
};
