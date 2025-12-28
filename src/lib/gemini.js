
/**
 * Analyze subscriptions from text or PDF via backend API
 * @param {string | ArrayBuffer} input - Text content or PDF as base64
 * @param {'text' | 'pdf'} inputType - Type of input
 * @returns {Promise<Object>} Parsed subscription analysis
 */
export const analyzeSubscriptions = async (input, inputType = 'text') => {
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ input, inputType }),
        });

        // Try to parse response as JSON
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            throw new Error(`Server error: ${text.substring(0, 100)}`);
        }

        if (!response.ok) {
            throw new Error(data.error || data.details || 'Failed to analyze subscriptions');
        }

        return data;
    } catch (error) {
        console.error("Analysis Error:", error);
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
