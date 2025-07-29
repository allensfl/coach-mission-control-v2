/* ===== COLLABORATION.JS - Coachee Interface Logik ===== */

const CollaborationInterface = {
    messageCount: 0,
    typingTimeout: null,
    isTyping: false,

    init() {
        this.setupMessageMonitoring();
        this.setupInputHandling();
        this.setupSessionTimer();
        this.setupKeyboardShortcuts();
        this.showWelcomeMessage();
        
        console.log('🤝 Collaboration Interface initialisiert');
    },

    // Setup verbessert mit mehr Debugging
    setupMessageMonitoring() {
        console.log('📋 Setting up message monitoring in collaboration window');
        
        if (!window.coachingComm) {
            console.error('❌ Kommunikation nicht verfügbar');
            return;
        }

        // Status-Updates
        window.coachingComm.onStatusChange((status) => {
            console.log('📊 Status update:', status);
            this.updateSessionStatus(status);
        });

        // Nachrichten-Updates mit verbessertem Debugging
        window.coachingComm.onMessagesUpdate((messages) => {
            console.log('📨 Message update received in collaboration window:', messages.length, 'messages');
            console.log('Messages:', messages);
            this.displayMessages(messages);
            this.updateMessageCount(messages.length);
        });

        // Force initial load nach kurzer Verzögerung
        setTimeout(() => {
            const initialMessages = window.coachingComm.getMessages();
            console.log('🏁 Force loading initial messages:', initialMessages.length);
            if (initialMessages.length > 0) {
                this.displayMessages(initialMessages);
                this.updateMessageCount(initialMessages.length);
            }
        }, 1000);

        // Typing-Indicator überwachen
        setInterval(() => {
            this.checkTypingIndicator();
        }, 1000);
    },

    // Input-Handling
    setupInputHandling() {
        const input = DOM.find('#responseInput');
        const sendBtn = DOM.find('#sendBtn');

        if (input && sendBtn) {
            // Input-Events
            DOM.on(input, 'input', (e) => {
                this.handleInputChange(e);
            });

            DOM.on(input, 'keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    this.sendResponse();
                }
            });

            // Send Button
            DOM.on(sendBtn, 'click', () => {
                this.sendResponse();
            });

            // Auto-resize textarea
            DOM.on(input, 'input', () => {
                input.style.height = 'auto';
                input.style.height = Math.min(input.scrollHeight, 150) + 'px';
            });
        }

        // Clear Button
        const clearBtn = DOM.find('.clear-input-btn');
        if (clearBtn) {
            DOM.on(clearBtn, 'click', () => {
                this.clearInput();
            });
        }
    },

    // Session-Timer
    setupSessionTimer() {
        SessionTimer.start();
        
        // Timer alle 10 Sekunden aktualisieren
        setInterval(() => {
            const timerElement = DOM.find('#sessionTime');
            if (timerElement) {
                timerElement.textContent = SessionTimer.getDuration();
            }
        }, 10000);
    },

    // Keyboard Shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Escape = Input fokussieren
            if (e.key === 'Escape') {
                const input = DOM.find('#responseInput');
                if (input) {
                    input.focus();
                }
            }
        });
    },

    // Welcome Message
    showWelcomeMessage() {
        const session = window.coachingComm?.getSession();
        if (session) {
            const welcomeDiv = DOM.find('.welcome-message');
            if (welcomeDiv) {
                Utils.animateElement(welcomeDiv, 'slide-in');
            }
        }
    },

    // Nachrichten anzeigen
    displayMessages(messages) {
        const container = DOM.find('#messagesArea');
        if (!container) return;

        console.log('📋 Displaying messages:', messages.length);

        // Container leeren wenn neue Nachrichten ankommen
        const existingCount = container.querySelectorAll('[data-message-id]').length;
        
        if (messages.length === 0) {
            // Wenn keine Nachrichten da sind, Welcome Message anzeigen
            container.innerHTML = `
                <div class="welcome-message">
                    <div class="message-bubble system">
                        <p>🎯 <strong>Willkommen zu Ihrer Coaching-Session!</strong></p>
                        <p>Hier findet der Dialog zwischen Ihnen und Ihrem Coach statt. Sie können jederzeit antworten und Fragen stellen.</p>
                    </div>
                </div>
            `;
            return;
        }

        // Wenn erste echte Nachrichten kommen, Container neu aufbauen
        if (existingCount === 0 || messages.length < existingCount) {
            container.innerHTML = '';
            
            messages.forEach(message => {
                const messageElement = this.createMessageElement(message);
                container.appendChild(messageElement);
                
                // Animation
                Utils.animateElement(messageElement, 'slide-in');
            });
        } else {
            // Nur neue Nachrichten hinzufügen
            const newMessages = messages.slice(existingCount);
            
            newMessages.forEach(message => {
                const messageElement = this.createMessageElement(message);
                container.appendChild(messageElement);
                
                // Animation
                Utils.animateElement(messageElement, 'slide-in');
            });
        }

        // Auto-scroll
        this.scrollToBottom();
        
        console.log('✅ Messages displayed successfully');
    },

    createMessageElement(message) {
        const time = Utils.formatTime(message.timestamp);
        const senderClass = this.getSenderClass(message.sender);
        const senderDisplay = this.getSenderDisplay(message.sender);
        
        return DOM.create('div', {
            className: `message-bubble ${senderClass}`,
            'data-message-id': message.id,
            innerHTML: `
                <div class="message-header">
                    <span class="message-sender">${senderDisplay}</span>
                    <span class="message-time">${time}</span>
                </div>
                <div class="message-content">
                    ${this.formatMessageContent(message.content)}
                </div>
            `
        });
    },

    getSenderClass(sender) {
        const lowerSender = sender.toLowerCase();
        if (lowerSender.includes('coach') && !lowerSender.includes('coachee')) return 'coach';
        if (lowerSender.includes('coachee')) return 'coachee';
        if (lowerSender.includes('ki') || lowerSender.includes('ai')) return 'ai';
        return 'system';
    },

    getSenderDisplay(sender) {
        const mapping = {
            'coach': '👨‍💼 Coach',
            'coachee': '👤 Sie',
            'system': '🎯 System',
            'ai': '🤖 KI-Coach'
        };
        
        const senderClass = this.getSenderClass(sender);
        return mapping[senderClass] || sender;
    },

    formatMessageContent(content) {
        return Utils.escapeHtml(content)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    },

    // Input-Handling
    handleInputChange(e) {
        const value = e.target.value;
        const sendBtn = DOM.find('#sendBtn');
        
        // Send-Button aktivieren/deaktivieren
        if (sendBtn) {
            sendBtn.disabled = !value.trim();
        }

        // Typing-Indicator
        if (value.length > 0 && !this.isTyping) {
            this.setTypingIndicator(true);
        } else if (value.length === 0 && this.isTyping) {
            this.setTypingIndicator(false);
        }

        // Auto-clear typing nach 3 Sekunden Inaktivität
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            this.setTypingIndicator(false);
        }, 3000);
    },

    setTypingIndicator(isTyping) {
        this.isTyping = isTyping;
        if (window.coachingComm) {
            window.coachingComm.setTyping(isTyping, 'Coachee');
        }
    },

    checkTypingIndicator() {
        if (!window.coachingComm) return;
        
        const typing = window.coachingComm.getTyping();
        const indicator = DOM.find('#typingIndicator');
        
        if (indicator) {
            if (typing && typing.sender !== 'Coachee') {
                indicator.style.display = 'flex';
                const text = indicator.querySelector('span:last-child');
                if (text) {
                    text.textContent = `${typing.sender} schreibt...`;
                }
            } else {
                indicator.style.display = 'none';
            }
        }
    },

    // Antwort senden
    sendResponse() {
        const input = DOM.find('#responseInput');
        const content = input?.value?.trim();
        
        if (!content) {
            Utils.showToast('Bitte geben Sie eine Antwort ein.', 'error');
            return;
        }

        if (!window.coachingComm) {
            Utils.showToast('Kommunikation nicht verfügbar.', 'error');
            return;
        }

        // Nachricht senden
        window.coachingComm.addMessage('Coachee', content);
        
        // Input leeren
        this.clearInput();
        
        // Typing-Indicator stoppen
        this.setTypingIndicator(false);
        
        console.log('✅ Antwort gesendet:', content);
    },

    clearInput() {
        const input = DOM.find('#responseInput');
        const sendBtn = DOM.find('#sendBtn');
        
        if (input) {
            input.value = '';
            input.style.height = 'auto';
            input.focus();
        }
        
        if (sendBtn) {
            sendBtn.disabled = true;
        }
        
        this.setTypingIndicator(false);
    },

    // UI-Updates
    updateSessionStatus(status) {
        const statusElement = DOM.find('#sessionStatus');
        if (statusElement) {
            statusElement.textContent = status;
            
            // Status-Farben
            statusElement.className = '';
            if (status.includes('Verbunden') || status.includes('connected')) {
                statusElement.style.background = 'rgba(16, 185, 129, 0.2)';
                statusElement.style.color = '#059669';
            } else if (status.includes('Warte') || status.includes('waiting')) {
                statusElement.style.background = 'rgba(245, 158, 11, 0.2)';
                statusElement.style.color = '#d97706';
            } else {
                statusElement.style.background = 'rgba(107, 114, 128, 0.2)';
                statusElement.style.color = '#6b7280';
            }
        }
    },

    updateMessageCount(count) {
        this.messageCount = count;
        const countElement = DOM.find('#messageCount');
        if (countElement) {
            countElement.textContent = `${count} Nachrichten`;
        }
    },

    scrollToBottom() {
        const container = DOM.find('#messagesArea');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    },

    // Hilfsfunktionen
    generateResponse(prompt) {
        // Einfache automatische Antworten basierend auf Prompt-Inhalt
        const responses = {
            'gt1': 'Vielen Dank für diese strukturierte Herangehensweise. Mein Anliegen ist...',
            'gt2': 'Das hilft mir sehr, die Situation zu durchdenken. Zusätzlich möchte ich noch erwähnen...',
            'sf1': 'Diese Spiegelung hilft mir zu verstehen. Was ich noch hinzufügen möchte...',
            'ziel': 'Mein konkretes Ziel ist es...',
            'ressourcen': 'Ich erkenne folgende Stärken und Ressourcen bei mir...',
            'wunderfrage': 'Wenn das Wunder geschehen wäre, würde ich merken...'
        };

        const promptLower = prompt.toLowerCase();
        for (const [key, response] of Object.entries(responses)) {
            if (promptLower.includes(key)) {
                return response;
            }
        }

        return 'Das ist eine interessante Frage. Lassen Sie mich darüber nachdenken...';
    },

    // Demo-Modus für Testing
    enableDemoMode() {
        console.log('🎭 Demo-Modus aktiviert');
        
        // Automatische Antworten nach Verzögerung
        window.coachingComm.onMessagesUpdate((messages) => {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage && lastMessage.sender === 'Coach') {
                setTimeout(() => {
                    const demoResponse = this.generateResponse(lastMessage.content);
                    const input = DOM.find('#responseInput');
                    if (input) {
                        input.value = demoResponse;
                        this.sendResponse();
                    }
                }, 2000 + Math.random() * 3000); // 2-5 Sekunden Verzögerung
            }
        });
    }
};

// Globale Funktionen für HTML-Aufrufe
window.sendResponse = function() {
    CollaborationInterface.sendResponse();
};

window.clearInput = function() {
    CollaborationInterface.clearInput();
};

// AI-Assistenz für Coachee (optional)
window.getAIHelp = function() {
    const lastMessages = window.coachingComm?.getMessages().slice(-3) || [];
    const context = lastMessages.map(m => `${m.sender}: ${m.content}`).join('\n');
    
    const helpText = `Basierend auf dem bisherigen Gespräch könnten Sie antworten:

"Das ist ein wichtiger Punkt. Ich denke, dass... [Ihre Gedanken]"

oder

"Das hilft mir zu verstehen. Was ich noch hinzufügen möchte..."

oder

"Ich merke, dass... [Ihre Beobachtung/Gefühl]"`;
    
    Utils.showToast('KI-Hilfe in der Konsole (F12)', 'info');
    console.log('🤖 KI-Hilfe für Ihre Antwort:\n', helpText);
};

// Page Visibility API für bessere UX
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Seite ist nicht sichtbar
        SessionTimer.stop();
    } else {
        // Seite ist wieder sichtbar
        SessionTimer.start();
        CollaborationInterface.scrollToBottom();
    }
});

// Initialisierung mit mehr Debugging
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 DOM Content Loaded in collaboration window');
    console.log('Window location:', window.location.href);
    
    if (window.location.pathname.includes('collaboration.html')) {
        console.log('✅ Detected collaboration.html');
        
        // Kurze Verzögerung für vollständige Initialisierung
        setTimeout(() => {
            console.log('🚀 Starting CollaborationInterface.init()');
            CollaborationInterface.init();
            console.log('🤝 Collaboration Interface bereit');
            
            // Debug info in UI anzeigen
            setTimeout(() => {
                const statusElement = DOM.find('#sessionStatus');
                if (statusElement && statusElement.textContent === 'Verbunden') {
                    console.log('📊 Status element found and connected');
                } else {
                    console.log('⚠️ Status element issues:', statusElement?.textContent);
                }
                
                // Force check for messages
                if (window.coachingComm) {
                    const messages = window.coachingComm.getMessages();
                    console.log('📨 Force check messages:', messages.length);
                    if (messages.length > 0) {
                        CollaborationInterface.displayMessages(messages);
                    }
                }
            }, 2000);
        }, 100);
    } else {
        console.log('❌ Not collaboration.html, skipping init');
    }
});

// Debug-Funktionen für das Collaboration Window
window.debugCollaboration = function() {
    console.log('=== COLLABORATION DEBUG ===');
    console.log('Window location:', window.location.href);
    console.log('CoachingComm available:', !!window.coachingComm);
    if (window.coachingComm) {
        console.log('Messages:', window.coachingComm.getMessages());
        console.log('Status:', window.coachingComm.getStatus());
        console.log('Session:', window.coachingComm.getSession());
    }
    console.log('Messages container:', DOM.find('#messagesArea'));
    console.log('Interface instance:', CollaborationInterface);
};

// Force reload messages
window.forceReloadMessages = function() {
    if (window.coachingComm) {
        const messages = window.coachingComm.getMessages();
        console.log('🔄 Force reloading messages:', messages);
        CollaborationInterface.displayMessages(messages);
    }
};

// Cleanup bei Fenster-Schließung
window.addEventListener('beforeunload', function() {
    if (CollaborationInterface.isTyping) {
        CollaborationInterface.setTypingIndicator(false);
    }
    SessionTimer.stop();
});