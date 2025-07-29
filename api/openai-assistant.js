// api/openai-assistant.js
// Vercel Function für OpenAI Assistant Integration

export default async function handler(req, res) {
  // CORS Headers für Frontend-Zugriff
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, context, threadId } = req.body;

    // OpenAI API Configuration
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

    if (!OPENAI_API_KEY || !ASSISTANT_ID) {
      return res.status(500).json({ 
        error: 'OpenAI configuration missing',
        details: 'API Key oder Assistant ID nicht konfiguriert'
      });
    }

    // 1. Thread erstellen oder verwenden
    let currentThreadId = threadId;
    
    if (!currentThreadId) {
      const threadResponse = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({})
      });

      if (!threadResponse.ok) {
        throw new Error(`Thread creation failed: ${threadResponse.statusText}`);
      }

      const thread = await threadResponse.json();
      currentThreadId = thread.id;
    }

    // 2. Message zum Thread hinzufügen
    const contextPrompt = context ? `
Kontext der Coaching-Session:
- Klient: ${context.clientName || 'Nicht angegeben'}
- Phase: ${context.phase || 'Nicht angegeben'}
- Ziel: ${context.goal || 'Nicht angegeben'}
- Bisheriger Verlauf: ${context.history || 'Neuer Dialog'}

Coaching-Anfrage: ${message}
` : message;

    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        role: 'user',
        content: contextPrompt
      })
    });

    if (!messageResponse.ok) {
      throw new Error(`Message creation failed: ${messageResponse.statusText}`);
    }

    // 3. Run starten
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        assistant_id: ASSISTANT_ID,
        instructions: "Du bist ein professioneller Coach-Assistant. Antworte präzise, empathisch und lösungsorientiert basierend auf deiner Coaching-Expertise."
      })
    });

    if (!runResponse.ok) {
      throw new Error(`Run creation failed: ${runResponse.statusText}`);
    }

    const run = await runResponse.json();

    // 4. Auf Completion warten
    let runStatus = run;
    let attempts = 0;
    const maxAttempts = 60; // 60 Sekunden Timeout

    while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
      if (attempts >= maxAttempts) {
        throw new Error('OpenAI Assistant Timeout');
      }

      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 Sekunde warten
      
      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs/${run.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      });

      if (!statusResponse.ok) {
        throw new Error(`Run status check failed: ${statusResponse.statusText}`);
      }

      runStatus = await statusResponse.json();
      attempts++;
    }

    if (runStatus.status !== 'completed') {
      throw new Error(`Run failed with status: ${runStatus.status}`);
    }

    // 5. Messages abrufen
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    if (!messagesResponse.ok) {
      throw new Error(`Messages retrieval failed: ${messagesResponse.statusText}`);
    }

    const messages = await messagesResponse.json();
    
    // Neueste Assistant-Antwort finden
    const assistantMessage = messages.data.find(msg => msg.role === 'assistant');
    
    if (!assistantMessage) {
      throw new Error('Keine Assistant-Antwort gefunden');
    }

    const responseText = assistantMessage.content[0]?.text?.value || 'Keine Antwort erhalten';

    // 6. Erfolgreiche Antwort
    res.status(200).json({
      success: true,
      response: responseText,
      threadId: currentThreadId,
      tokensUsed: runStatus.usage || null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('OpenAI Assistant Error:', error);
    
    // Fallback-Antwort bei Fehlern
    res.status(500).json({
      success: false,
      error: error.message,
      fallbackResponse: `Entschuldigung, ich kann momentan nicht auf den AI-Assistant zugreifen. 

Als Coach-Unterstützung kann ich dir folgende allgemeine Empfehlungen geben:
- Stelle offene Fragen um mehr über die Situation zu erfahren
- Höre aktiv zu und reflektiere das Gehörte
- Fokussiere auf Lösungen statt auf Probleme
- Ermutige zur Selbstreflexion

Bitte versuche es in einem Moment erneut.`,
      timestamp: new Date().toISOString()
    });
  }
}