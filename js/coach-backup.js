// coach.js - Updated mit OpenAI Assistant Integration

// Thread-Management für OpenAI Assistant
let currentThreadId = null;
let aiProcessing = false;

// Original Coach-Funktionalität beibehalten
class CoachingInterface {
    constructor() {
        this.currentClient = null;
        this.currentPhase = 'exploration';
        this.sessionHistory = [];
        this.initializeInterface();
    }

    initializeInterface() {
        this.setupEventListeners();
        this.loadClients();
        this.loadPrompts();
        this.updatePhaseDisplay();
    }

    setupEventListeners() {
        // AI Response Button
        const aiBtn = document.getElementById('generateAI');
        if (aiBtn) {
            aiBtn.addEventListener('click', () => this.handleAIRequest());
        }

        // Send Message Button
        const sendBtn = document.getElementById('sendMessage');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        // Input Enter Key
        const input = document.getElementById('coachInput');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // Phase Selection
        document.querySelectorAll('.phase-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentPhase = e.target.dataset.phase;
                this.updatePhaseDisplay();
            });
        });

        // Client Selection
        document.querySelectorAll('.client-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const clientId = e.currentTarget.dataset.clientId;
                this.selectClient(clientId);
            });
        });
    }

    // OpenAI Assistant Integration
    async handleAIRequest() {
        const input = document.getElementById('coachInput');
        const message = input.value.trim();
        
        if (!message) {
            this.showNotification('Bitte gib eine Nachricht ein.', 'warning');
            return;
        }

        if (aiProcessing) {
            this.showNotification('KI-Anfrage läuft bereits...', 'info');
            return;
        }

        try {
            aiProcessing = true;
            this.updateAIButtonState(true);
            
            // Kontext für AI sammeln
            const context = this.getCoachingContext();
            
            // Message im Chat anzeigen
            this.addMessageToChat('coach', message);
            
            // OpenAI Assistant anfragen
            const aiResponse = await this.callOpenAIAssistant(message, context);
            
            if (aiResponse.success) {
                // AI Antwort im Chat anzeigen
                this.addMessageToChat('ai', aiResponse.response);
                
                // Thread ID für weitere Nachrichten speichern
                if (aiResponse.threadId) {
                    currentThreadId = aiResponse.threadId;
                }
                
                // Input leeren
                input.value = '';
                
                this.showNotification('KI-Antwort erhalten', 'success');
            } else {
                // Fallback-Antwort anzeigen
                this.addMessageToChat('ai', aiResponse.fallbackResponse);
                this.showNotification('KI-Service temporär nicht verfügbar', 'warning');
            }
            
        } catch (error) {
            console.error('AI Request Error:', error);
            this.addMessageToChat('ai', 'Entschuldigung, es gab ein Problem bei der Kommunikation mit dem KI-Assistant. Bitte versuche es erneut.');
            this.showNotification('Fehler bei KI-Anfrage', 'error');
        } finally {
            aiProcessing = false;
            this.updateAIButtonState(false);
        }
    }

    // OpenAI Assistant API Call
    async callOpenAIAssistant(message, context) {
        const response = await fetch('/api/openai-assistant', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                context: context,
                threadId: currentThreadId
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    // Coaching-Kontext für AI sammeln
    getCoachingContext() {
        return {
            clientName: this.currentClient?.name || null,
            clientDetails: this.currentClient || null,
            phase: this.currentPhase,
            goal: this.currentClient?.goal || null,
            history: this.getRecentChatHistory(),
            sessionDuration: this.getSessionDuration(),
            timestamp: new Date().toISOString()
        };
    }

    getRecentChatHistory() {
        const chatMessages = document.querySelectorAll('.chat-message');
        const recentMessages = Array.from(chatMessages)
            .slice(-6) // Letzte 6 Nachrichten
            .map(msg => {
                const role = msg.classList.contains('coach-message') ? 'Coach' : 
                           msg.classList.contains('ai-message') ? 'AI' : 'System';
                const content = msg.querySelector('.message-content')?.textContent || '';
                return `${role}: ${content}`;
            })
            .join('\n');
        
        return recentMessages || 'Neue Session';
    }

    getSessionDuration() {
        // Vereinfacht - in echter Anwendung würde man Start-Zeit tracken
        const messages = document.querySelectorAll('.chat-message').length;
        return `${messages} Nachrichten ausgetauscht`;
    }

    // UI Updates für AI-Processing
    updateAIButtonState(processing) {
        const btn = document.getElementById('generateAI');
        if (btn) {
            if (processing) {
                btn.textContent = 'KI denkt...';
                btn.disabled = true;
                btn.style.opacity = '0.6';
            } else {
                btn.textContent = 'KI-Beratung';
                btn.disabled = false;
                btn.style.opacity = '1';
            }
        }
    }

    // Chat-Nachricht hinzufügen
    addMessageToChat(type, content) {
        const chatContainer = document.getElementById('chatMessages') || document.querySelector('.chat-messages');
        if (!chatContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', `${type}-message`);
        
        const timestamp = new Date().toLocaleTimeString('de-DE', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        const roleLabel = {
            'coach': 'Coach',
            'ai': 'KI-Assistant',
            'coachee': 'Coachee',
            'system': 'System'
        }[type] || 'Unbekannt';

        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="message-role">${roleLabel}</span>
                <span class="message-time">${timestamp}</span>
            </div>
            <div class="message-content">${content}</div>
        `;

        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // Session History aktualisieren
        this.sessionHistory.push({
            type: type,
            content: content,
            timestamp: new Date().toISOString()
        });
    }

    // Notification System
    showNotification(message, type = 'info') {
        // Existierende Notification entfernen
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.classList.add('notification', `notification-${type}`);
        notification.textContent = message;
        
        // Styling
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : 
                         type === 'warning' ? '#f59e0b' : 
                         type === 'error' ? '#ef4444' : '#6b7280'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            font-weight: 500;
            backdrop-filter: blur(10px);
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // Auto-remove nach 4 Sekunden
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    // Original Coach-Methoden beibehalten
    loadClients() {
        // Bestehende Client-Loading Logik
        if (typeof clientsData !== 'undefined') {
            this.renderClients(clientsData);
        }
    }

    loadPrompts() {
        // Bestehende Prompt-Loading Logik
        if (typeof promptsData !== 'undefined') {
            this.renderPrompts(promptsData);
        }
    }

    selectClient(clientId) {
        this.currentClient = clientsData.find(c => c.id == clientId);
        if (this.currentClient) {
            document.querySelectorAll('.client-card').forEach(card => {
                card.classList.remove('selected');
            });
            document.querySelector(`[data-client-id="${clientId}"]`).classList.add('selected');
            
            // Neuen Thread für neuen Client starten
            currentThreadId = null;
            
            this.showNotification(`Klient ${this.currentClient.name} ausgewählt`, 'success');
        }
    }

    updatePhaseDisplay() {
        document.querySelectorAll('.phase-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-phase="${this.currentPhase}"]`)?.classList.add('active');
    }

    sendMessage() {
        const input = document.getElementById('coachInput');
        const message = input.value.trim();
        
        if (message) {
            this.addMessageToChat('coach', message);
            input.value = '';
        }
    }

    renderClients(clients) {
        const container = document.querySelector('.clients-container');
        if (!container) return;

        container.innerHTML = clients.map(client => `
            <div class="client-card" data-client-id="${client.id}">
                <h3>${client.name}</h3>
                <p><strong>Ziel:</strong> ${client.goal}</p>
                <p><strong>Status:</strong> ${client.status}</p>
                <div class="client-meta">
                    <span>Termine: ${client.sessions}</span>
                    <span>Letzter Kontakt: ${client.lastContact}</span>
                </div>
            </div>
        `).join('');

        // Event Listeners für Client Cards
        document.querySelectorAll('.client-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const clientId = e.currentTarget.dataset.clientId;
                this.selectClient(clientId);
            });
        });
    }

    renderPrompts(prompts) {
        const container = document.querySelector('.prompt-repository');
        if (!container) return;

        container.innerHTML = prompts.map(prompt => `
            <div class="prompt-card" data-category="${prompt.category}">
                <h4>${prompt.title}</h4>
                <p>${prompt.description}</p>
                <div class="prompt-actions">
                    <button onclick="coachInterface.usePrompt('${prompt.id}')">Verwenden</button>
                </div>
            </div>
        `).join('');
    }

    usePrompt(promptId) {
        const prompt = promptsData.find(p => p.id === promptId);
        if (prompt) {
            document.getElementById('coachInput').value = prompt.text;
            this.showNotification(`Prompt "${prompt.title}" geladen`, 'success');
        }
    }
}

// CSS für Notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .chat-message {
        margin-bottom: 16px;
        padding: 12px;
        border-radius: 8px;
        backdrop-filter: blur(10px);
    }
    
    .coach-message {
        background: rgba(59, 130, 246, 0.1);
        border-left: 3px solid #3b82f6;
    }
    
    .ai-message {
        background: rgba(16, 185, 129, 0.1);
        border-left: 3px solid #10b981;
    }
    
    .coachee-message {
        background: rgba(249, 115, 22, 0.1);
        border-left: 3px solid #f97316;
    }
    
    .message-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        font-size: 0.875rem;
        opacity: 0.8;
    }
    
    .message-role {
        font-weight: 600;
    }
    
    .message-time {
        font-size: 0.75rem;
    }
    
    .message-content {
        line-height: 1.5;
        white-space: pre-wrap;
    }
`;
document.head.appendChild(notificationStyles);

// Interface initialisieren
let coachInterface;
document.addEventListener('DOMContentLoaded', () => {
    coachInterface = new CoachingInterface();
});