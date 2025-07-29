// api/translate-berndeutsch.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { text } = req.body;

        if (!text || text.trim() === '') {
            return res.status(400).json({ error: 'Text is required' });
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'Du bist ein Experte für Schweizer Dialekte und Berndeutsch. Übersetze präzise vom Berndeutsch/Schweizerdeutsch ins Hochdeutsche. Behalte dabei die ursprüngliche Bedeutung, den Ton und die Emotion bei. Gib nur die Übersetzung zurück, keine Erklärungen.'
                    },
                    {
                        role: 'user',
                        content: `Übersetze diesen Berndeutsch/Schweizerdeutsch Text ins Hochdeutsche:\n\n"${text}"`
                    }
                ],
                temperature: 0.3,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`OpenAI API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        const translation = data.choices[0].message.content.trim();

        res.status(200).json({ 
            success: true,
            translation: translation,
            original: text
        });

    } catch (error) {
        console.error('Translation Error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Translation failed',
            message: error.message 
        });
    }
}