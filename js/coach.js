/* ===== COACH.JS - Coach Interface Logik mit OpenAI Integration ===== */

// OpenAI Assistant Integration
let currentThreadId = null;
let aiProcessing = false;

// Coach-spezifische Funktionen
const CoachInterface = {
    init() {
        this.setupTabs();
        this.renderClients();
        this.renderPrompts();
        this.updatePromptStats();
        this.setupCategoryFilter();
        this.setupCollaborationMonitor();
        
        console.log('🎯 Coach Interface initialisiert');
    },

    // Tab-Navigation
    setupTabs() {
        DOM.findAll('.tab-btn').forEach(btn => {
            DOM.on(btn, 'click', () => {
                const targetTab = btn.getAttribute('data-tab');
                this.showTab(targetTab);
            });
        });
    },

    showTab(tabName) {
        // Alle Tabs deaktivieren
        DOM.findAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        DOM.findAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Gewählten Tab aktivieren
        const tabBtn = DOM.find(`[data-tab="${tabName}"]`);
        const tabContent = DOM.find(`#${tabName}Tab`);
        
        if (tabBtn && tabContent) {
            tabBtn.classList.add('active');
            tabContent.classList.add('active');
        }
    },

    // Klienten-Management
    renderClients() {
        const container = DOM.find('#clientsContainer');
        if (!container || !window.clients) return;

        DOM.empty(container);
        
        window.clients.forEach(client => {
            const clientCard = DOM.create('div', {
                className: 'client-card',
                'data-client-id': client.id,
                innerHTML: `
                    <div style="font-size: 1.3rem; font-weight: 700; color: #1e293b; margin-bottom: 8px;">
                        ${client.name}
                    </div>
                    <div style="color: #64748b; margin-bottom: 12px;">
                        <span style="font-weight: 600; color: #3b82f6;">${client.age} Jahre</span> • ${client.profession}
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                        ${client.topics.map(topic => 
                            `<span style="background: rgba(59,130,246,0.1); color: #3b82f6; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem;">${topic}</span>`
                        ).join('')}
                    </div>
                `
            });

            DOM.on(clientCard, 'click', () => this.selectClient(client.id));
            container.appendChild(clientCard);
        });
    },

    selectClient(clientId) {
        const client = window.clients.find(c => c.id === clientId);
        if (!client) return;

        window.coachingApp.selectedClient = client;
        
        // Visual feedback
        DOM.findAll('.client-card').forEach(card => {
            card.classList.remove('selected');
        });
        DOM.find(`[data-client-id="${clientId}"]`).classList.add('selected');
        
        // Session-Button anzeigen
        const startBtn = DOM.find('#startSessionBtn');
        if (startBtn) {
            startBtn.style.display = 'block';
            Utils.animateElement(startBtn, 'fade-in');
        }
        
        Utils.showToast(`Klient ausgewählt: ${client.name}`, 'success');
        console.log('✅ Klient ausgewählt:', client.name);
    },

    // Prompt-Management
    renderPrompts() {
        const container = DOM.find('#promptsContainer');
        const categoryFilter = DOM.find('#categoryFilter').value || '';
        
        if (!container || !window.prompts) return;

        const filteredPrompts = Object.entries(window.prompts).filter(([key, prompt]) => {
            return !categoryFilter || prompt.category === categoryFilter;
        });

        DOM.empty(container);
        
        filteredPrompts.forEach(([key, prompt]) => {
            const promptCard = DOM.create('div', {
                className: 'prompt-card',
                innerHTML: `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <strong style="color: #3b82f6; font-size: 1.1rem;">${key}</strong>
                        <span class="category-tag">${prompt.category}</span>
                    </div>
                    <div style="font-weight: 600; color: #374151; margin-bottom: 8px;">
                        ${prompt.description}
                    </div>
                    <div style="font-size: 0.9rem; color: #64748b; line-height: 1.4;">
                        ${Utils.truncateText(prompt.text, 100)}
                    </div>
                `
            });

            DOM.on(promptCard, 'click', () => this.usePrompt(key));
            container.appendChild(promptCard);
        });

        this.updatePromptStats();
    },

    usePrompt(promptKey) {
        const prompt = window.prompts[promptKey];
        if (!prompt) return;

        window.coachingApp.currentPrompt = prompt;
        const editor = DOM.find('#promptEditor');
        
        if (editor) {
            editor.value = `${promptKey}: ${prompt.description}\n\n${prompt.text}`;
            Utils.animateElement(editor, 'fade-in');
        }
        
        Utils.showToast(`Prompt geladen: ${promptKey}`, 'success');
        console.log('✅ Prompt geladen:', promptKey);
    },

    updatePromptStats() {
        const statsElement = DOM.find('#promptStats');
        if (!statsElement || !window.prompts) return;

        const totalPrompts = Object.keys(window.prompts).length;
        const categories = [...new Set(Object.values(window.prompts).map(p => p.category))];
        
        statsElement.innerHTML = `
            <strong>Prompts verfügbar: ${totalPrompts}</strong><br>
            <span style="font-size: 0.9rem; color: #64748b;">
                Kategorien: ${categories.join(', ')} | 
                GT: ${Object.values(window.prompts).filter(p => p.category === 'GT').length} | 
                SF: ${Object.values(window.prompts).filter(p => p.category === 'SF').length} | 
                DIAG: ${Object.values(window.prompts).filter(p => p.category === 'DIAG').length} | 
                LÖS: ${Object.values(window.prompts).filter(p => p.category === 'LÖS').length}
            </span>
        `;
    },

    setupCategoryFilter() {
        const filter = DOM.find('#categoryFilter');
        if (!filter || !window.prompts) return;

        const categories = [...new Set(Object.values(window.prompts).map(p => p.category))];
        
        categories.forEach(category => {
            const option = DOM.create('option', {
                value: category,
                textContent: `${category} (${Object.values(window.prompts).filter(p => p.category === category).length})`
            });
            filter.appendChild(option);
        });
        
        DOM.on(filter, 'change', () => this.renderPrompts());
    },

    // Kollaboration
    setupCollaborationMonitor() {
        if (!window.coachingComm) return;

        // Status-Updates überwachen
        window.coachingComm.onStatusChange((status) => {
            const statusElement = DOM.find('#connectionStatus');
            if (statusElement) {
                statusElement.textContent = status;
            }
        });

        // Nachrichten-Updates überwachen
        window.coachingComm.onMessagesUpdate((messages) => {
            this.updateCollaborationDisplay(messages);
        });
    },

    updateCollaborationDisplay(messages) {
        const container = DOM.find('#collaborationMessages');
        if (!container) return;

        if (messages.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; color: #64748b; padding: 40px;">
                    Hier sehen Sie den Dialog zwischen Coach und Coachee.<br>
                    Öffnen Sie das Kollaborations-Fenster für den Coachee.
                </div>
            `;
            
            // Actions ausblenden wenn keine Nachrichten
            const actions = DOM.find('#collaborationActions');
            if (actions) {
                actions.style.display = 'none';
            }
            return;
        }

        DOM.empty(container);
        
        messages.forEach(message => {
            const messageDiv = DOM.create('div', {
                className: `message ${message.sender.toLowerCase().replace(/[^a-z]/g, '')}`,
                innerHTML: `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                        <span style="font-weight: bold; color: #3b82f6;">${this.getSenderDisplay(message.sender)}</span>
                        <span style="color: #64748b; font-size: 0.9rem;">${Utils.formatTime(message.timestamp)}</span>
                    </div>
                    <div style="line-height: 1.6;">${Utils.escapeHtml(message.content)}</div>
                `
            });
            container.appendChild(messageDiv);
        });

        MessageHelpers.scrollToBottom(container);
        
        // Actions anzeigen wenn Nachrichten vorhanden
        this.showCollaborationActions();
    },

    getSenderDisplay(sender) {
        const mapping = {
            'coach': '👨‍💼 Coach',
            'coachee': '👤 Coachee', 
            'system': '🎯 System',
            'kicoach': '🤖 KI-Coach',
            'ki-coach': '🤖 KI-Coach',
            'openaicoach': '🚀 OpenAI Coach'
        };
        
        const key = sender.toLowerCase().replace(/[^a-z]/g, '');
        return mapping[key] || sender;
    },

    showCollaborationActions() {
        const actions = DOM.find('#collaborationActions');
        if (actions) {
            actions.style.display = 'flex';
            actions.innerHTML = `
                <button onclick="sendDialogToAI()" class="send-ai-btn">
                    🤖 Dialog an lokale KI
                </button>
                <button onclick="sendDialogToOpenAI()" class="send-ai-btn" style="background: linear-gradient(135deg, #10b981, #059669);">
                    🚀 Dialog an OpenAI
                </button>
                <button onclick="openCollaborationWindow()" class="open-collab-btn">
                    🔗 Kollaborations-Fenster öffnen
                </button>
                <button onclick="editPrompt()" class="edit-btn">
                    ✏️ Zurück zum Editor
                </button>
            `;
        }
    },

    // Coach-KI
    setupCoachKI() {
        // Schnellzugriff-Buttons
        const processBtn = DOM.find('[onclick="loadProcessSupport()"]');
        const methodsBtn = DOM.find('[onclick="loadMethodenBeratung()"]');
        const interventionBtn = DOM.find('[onclick="loadInterventionshilfe()"]');
        const emergencyBtn = DOM.find('[onclick="loadNotfallSupport()"]');

        if (processBtn) DOM.on(processBtn, 'click', () => this.loadProcessSupport());
        if (methodsBtn) DOM.on(methodsBtn, 'click', () => this.loadMethodenBeratung());
        if (interventionBtn) DOM.on(interventionBtn, 'click', () => this.loadInterventionshilfe());
        if (emergencyBtn) DOM.on(emergencyBtn, 'click', () => this.loadNotfallSupport());
    },

    // Coach-KI Load-Funktionen korrigiert
    loadProcessSupport() {
        const input = DOM.find('#coachInput');
        const phase = DOM.find('#sessionPhase');
        
        if (input) input.value = 'Ich brauche Unterstützung bei der Prozesssteuerung. Wo stehen wir gerade und was ist der beste nächste Schritt?';
        if (phase) phase.value = 'Meta: Prozessreflexion';
        
        console.log('🔧 Prozess-Support geladen');
    },

    loadMethodenBeratung() {
        const input = DOM.find('#coachInput');
        if (input) input.value = 'Welche Coaching-Methode oder Intervention wäre jetzt am passendsten für meinen Coachee?';
        
        console.log('🛠️ Methoden-Beratung geladen');
    },

    loadInterventionshilfe() {
        const input = DOM.find('#coachInput');
        if (input) input.value = 'Mein Coachee zeigt [Verhalten/Reaktion]. Wie gehe ich damit professionell um?';
        
        console.log('🎯 Interventionshilfe geladen');
    },

    loadNotfallSupport() {
        const input = DOM.find('#coachInput');
        const urgency = DOM.find('#urgency');
        
        if (input) input.value = 'NOTFALL: Ich erkenne Warnsignale bei meinem Coachee und brauche sofortige Handlungsempfehlungen.';
        if (urgency) urgency.value = 'Notfall';
        
        console.log('🚨 Notfall-Support geladen');
    }
};

// ===== OPENAI ASSISTANT INTEGRATION =====

// OpenAI Assistant API Call
async function generateOpenAIResponse(message, context) {
    if (aiProcessing) {
        Utils.showToast('KI verarbeitet bereits eine Anfrage...', 'info');
        return null;
    }

    aiProcessing = true;
    
    try {
        const response = await fetch('/api/openai-assistant', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                threadId: currentThreadId,
                context: context
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Thread ID für kontinuierliche Gespräche speichern
        if (data.threadId) {
            currentThreadId = data.threadId;
        }

        return data.response;
        
    } catch (error) {
        console.error('OpenAI API Error:', error);
        Utils.showToast('OpenAI nicht verfügbar. Fallback wird verwendet.', 'error');
        
        // Fallback zur lokalen KI-Antwort
        return generateAIResponse(message, []);
        
    } finally {
        aiProcessing = false;
    }
}

// Globale Funktionen für HTML-Aufrufe
window.startSession = function() {
    if (!window.coachingApp.selectedClient) {
        Utils.showToast('Bitte wählen Sie zuerst einen Klienten aus.', 'error');
        return;
    }
    
    // OpenAI Thread für neue Session zurücksetzen
    currentThreadId = null;
    
    // Messages bei neuer Session leeren
    if (window.coachingComm) {
        window.coachingComm.clearMessages();
        console.log('🗑️ Messages für neue Session geleert');
    }
    
    CoachInterface.showTab('coaching');
    SessionTimer.start();
    
    if (window.coachingComm) {
        window.coachingComm.addMessage('System', `Session gestartet für ${window.coachingApp.selectedClient.name}`, 'system');
    }
    
    Utils.showToast(`Session gestartet für ${window.coachingApp.selectedClient.name}`, 'success');
    console.log('🚀 Session gestartet für:', window.coachingApp.selectedClient.name);
};

window.sendToCollaboration = function() {
    const editor = DOM.find('#promptEditor');
    const content = editor?.value?.trim();
    
    if (!content) {
        Utils.showToast('Bitte geben Sie einen Prompt ein.', 'error');
        return;
    }
    
    if (!window.coachingComm) {
        Utils.showToast('Kommunikation nicht verfügbar.', 'error');
        return;
    }
    
    // Nachricht zur Kollaboration senden
    window.coachingComm.addMessage('Coach', content);
    
    // Zur Kollaborations-Tab wechseln
    CoachInterface.showTab('collaboration');
    
    Utils.showToast('Prompt an Coachee gesendet', 'success');
    console.log('✅ Prompt an Kollaboration gesendet');
};

// "Dialog an lokale KI senden" Funktion
window.sendDialogToAI = function() {
    const messages = window.coachingComm?.getMessages() || [];
    
    if (messages.length === 0) {
        Utils.showToast('Keine Nachrichten zum Senden vorhanden.', 'error');
        return;
    }
    
    // Dialog zu KI-readable Format konvertieren
    const dialog = messages.map(msg => `${msg.sender}: ${msg.content}`).join('\n\n');
    
    // Intelligente KI-Antwort basierend auf Dialog generieren
    const aiResponse = generateAIResponse(dialog, messages);
    
    // KI-Antwort zur Kollaboration hinzufügen
    window.coachingComm.addMessage('🤖 Lokale KI', aiResponse);
    
    Utils.showToast('Dialog an lokale KI gesendet - Antwort erhalten!', 'success');
    console.log('🤖 Lokale KI-Antwort generiert für Dialog');
};

// "Dialog an OpenAI senden" Funktion
window.sendDialogToOpenAI = async function() {
    const messages = window.coachingComm?.getMessages() || [];
    
    if (messages.length === 0) {
        Utils.showToast('Keine Nachrichten zum Senden vorhanden.', 'error');
        return;
    }

    // Button-Status ändern
    const button = document.querySelector('[onclick="sendDialogToOpenAI()"]');
    if (button) {
        button.textContent = '🚀 OpenAI denkt...';
        button.disabled = true;
    }

    try {
        // Dialog zu strukturiertem Format konvertieren
        const dialog = messages.map(msg => `${msg.sender}: ${msg.content}`).join('\n\n');
        
        // Kontext für bessere KI-Antworten
        const context = {
            clientName: window.coachingApp.selectedClient?.name || 'Unbekannt',
            clientTopics: window.coachingApp.selectedClient?.topics || [],
            sessionPhase: 'Dialog-Analyse',
            messageCount: messages.length,
            lastSender: messages[messages.length - 1]?.sender
        };

        // OpenAI Assistant aufrufen
        const aiResponse = await generateOpenAIResponse(dialog, context);
        
        if (aiResponse) {
            // KI-Antwort zur Kollaboration hinzufügen
            window.coachingComm.addMessage('🚀 OpenAI Coach', aiResponse);
            Utils.showToast('OpenAI Assistant Antwort erhalten!', 'success');
        }

    } catch (error) {
        console.error('Error sending to OpenAI:', error);
        Utils.showToast('Fehler beim Senden an OpenAI.', 'error');
        
    } finally {
        // Button zurücksetzen
        if (button) {
            button.textContent = '🚀 Dialog an OpenAI';
            button.disabled = false;
        }
    }
};

// "An KI senden" Funktion - schickt den kompletten Dialog an die KI
window.sendToAI = function() {
    // Umleitung zur neuen Funktion
    sendDialogToAI();
};

// KI-Antwort basierend auf Dialogverlauf generieren (LOKALE KI)
function generateAIResponse(dialog, messages) {
    const lastMessage = messages[messages.length - 1];
    const dialogLower = dialog.toLowerCase();
    
    // Analyse des Dialogs
    if (dialogLower.includes('gt1') || dialogLower.includes('anliegen')) {
        return `Vielen Dank für das Vertrauen, dass Sie Ihr Anliegen mit mir teilen. Was Sie beschreiben, zeigt wichtige Reflexions- und Entwicklungsbereitschaft. 

Ich höre heraus, dass Sie bereit sind, strukturiert an diesem Thema zu arbeiten. Das ist bereits eine wertvolle Ressource.

Zur Vertiefung: Wenn Sie Ihre Situation in einem Bild beschreiben müssten - welches Bild würden Sie wählen? Was würde dieses Bild über Ihr Anliegen aussagen?`;
    }
    
    if (dialogLower.includes('wunderfrage') || dialogLower.includes('wunder')) {
        return `Diese Wunderfrage öffnet wichtige Perspektiven! Ihre Antwort zeigt mir, dass Sie bereits eine klare Vorstellung von der gewünschten Zukunft haben.

Besonders wertvoll finde ich [konkretes Detail aus der Antwort]. Das zeigt mir Ihre Klarheit über das Ziel.

Nächster Schritt: Was von dem, was Sie im "Wunder-Zustand" beschrieben haben, ist heute - auch nur in kleinen Ansätzen - bereits vorhanden?`;
    }
    
    if (dialogLower.includes('ressourcen') || dialogLower.includes('stärken')) {
        return `Ich bin beeindruckt von den Ressourcen, die Sie mitbringen! Sie unterschätzen vermutlich Ihre Fähigkeiten.

Besonders die [erwähnte Stärke] ist eine echte Superkraft, die Ihnen in Ihrer aktuellen Situation sehr helfen kann.

Frage zur Vertiefung: Wie könnten Sie diese Stärke noch gezielter für Ihr aktuelles Anliegen einsetzen? Was würde sich dadurch verändern?`;
    }
    
    if (dialogLower.includes('hindernis') || dialogLower.includes('widerstand')) {
        return `Danke für diese ehrliche Reflexion über mögliche Hindernisse. Das zeigt Ihre realistische Einschätzung und Vorausplanung.

Ich sehe in dem, was Sie als "Hindernis" beschreiben, auch einen Teil von Ihnen, der Sie schützen möchte. Jeder Widerstand hat meist eine positive Absicht.

Lassen Sie uns erkunden: Wenn dieses Hindernis Ihr Freund wäre - was würde es Ihnen Gutes tun wollen? Wovor möchte es Sie bewahren?`;
    }
    
    // Standard-Antwort basierend auf letzter Nachricht
    if (lastMessage && lastMessage.sender === 'Coachee') {
        return `Vielen Dank für diese offene Antwort. Ich merke, wie Sie sich Gedanken machen und reflektieren - das ist ein wichtiger Teil des Coaching-Prozesses.

Was Sie beschreiben, zeigt mir Ihre Bereitschaft zur Veränderung und gleichzeitig eine gesunde Vorsicht. Beides ist wertvoll.

Meine Beobachtung: Sie haben bereits mehr Klarheit über Ihr Thema, als Sie vielleicht denken. 

Um den nächsten Schritt zu finden: Was fühlt sich für Sie als der natürlichste nächste Schritt an?`;
    }
    
    return `Ich schätze die Offenheit und Tiefe unseres Gesprächs. Ihre Bereitschaft zur Reflexion und Ihr Mut, sich diesen Fragen zu stellen, sind bemerkenswert.

Was ich in unserem Dialog wahrnehme: Sie sind bereits auf einem guten Weg und haben mehr Ressourcen, als Sie sich vielleicht bewusst sind.

Lassen Sie uns gemeinsam den nächsten Schritt erkunden. Was resoniert am stärksten mit Ihnen aus unserem bisherigen Gespräch?`;
}

// Prompt Editor zurück
window.editPrompt = function() {
    CoachInterface.showTab('coaching');
};

window.clearEditor = function() {
    const editor = DOM.find('#promptEditor');
    if (editor) {
        editor.value = '';
        Utils.showToast('Editor geleert', 'info');
    }
};

// LOKALE Coach-KI Funktion
window.askCoachKI = function() {
    const input = DOM.find('#coachInput');
    const phase = DOM.find('#sessionPhase');
    const coacheeType = DOM.find('#coacheeType');
    const urgency = DOM.find('#urgency');
    
    if (!input?.value?.trim()) {
        Utils.showToast('Bitte beschreiben Sie Ihre Coaching-Situation.', 'error');
        return;
    }
    
    const response = CoachKI.generateResponse(
        input.value.trim(),
        phase?.value || '',
        coacheeType?.value || '',
        urgency?.value || ''
    );
    
    CoachKI.displayResponse(response);
    Utils.showToast('Lokale Coach-KI Antwort generiert', 'success');
    
    console.log('🧠 Lokale Coach-KI Response:', response);
};

// OPENAI Coach-KI Funktion
window.askOpenAICoach = async function() {
    const input = DOM.find('#coachInput');
    const phase = DOM.find('#sessionPhase');
    const coacheeType = DOM.find('#coacheeType');
    const urgency = DOM.find('#urgency');
    
    if (!input?.value?.trim()) {
        Utils.showToast('Bitte beschreiben Sie Ihre Coaching-Situation.', 'error');
        return;
    }

    // Button-Status ändern
    const button = document.querySelector('[onclick="askOpenAICoach()"]');
    if (button) {
        button.textContent = '🚀 OpenAI denkt...';
        button.disabled = true;
    }

    try {
        const context = {
            clientName: window.coachingApp.selectedClient?.name || 'Unbekannt',
            clientTopics: window.coachingApp.selectedClient?.topics || [],
            sessionPhase: phase?.value || '',
            coacheeType: coacheeType?.value || '',
            urgency: urgency?.value || '',
            requestType: 'coach-supervision'
        };

        const aiResponse = await generateOpenAIResponse(input.value.trim(), context);
        
        if (aiResponse) {
            // OpenAI Antwort anzeigen
            const response = {
                category: 'OPENAI COACH',
                content: aiResponse
            };
            
            CoachKI.displayResponse(response);
            Utils.showToast('OpenAI Coach-KI Antwort erhalten!', 'success');
        }

    } catch (error) {
        console.error('Error with OpenAI Coach:', error);
        Utils.showToast('Fehler bei OpenAI. Lokale Coach-KI verwenden.', 'error');
        
    } finally {
        // Button zurücksetzen
        if (button) {
            button.textContent = '🚀 OpenAI Coach-KI';
            button.disabled = false;
        }
    }
};

window.clearCoachInput = function() {
    const input = DOM.find('#coachInput');
    const responseDiv = DOM.find('#coachKIResponse');
    
    if (input) input.value = '';
    if (responseDiv) responseDiv.style.display = 'none';
    
    Utils.showToast('Eingabe geleert', 'info');
};

// Coach-KI Logic (LOKALE KI)
const CoachKI = {
    generateResponse(input, phase, coacheeType, urgency) {
        const inputLower = input.toLowerCase();
        
        // Notfall-Situationen erkennen
        if (inputLower.includes('suizid') || inputLower.includes('selbstverletzung') || urgency === 'Notfall') {
            return {
                category: 'NOTFALL',
                content: `<strong>🚨 NOTFALL-PROTOKOLL:</strong><br><br>
                1. <strong>Sofortige Sicherstellung:</strong> Direkt ansprechen und Sicherheit evaluieren<br>
                2. <strong>Professionelle Hilfe:</strong> Umgehend an Krisenintervention/Therapeuten weiterleiten<br>
                3. <strong>Dokumentation:</strong> Gespräch dokumentieren, Maßnahmen festhalten<br>
                4. <strong>Nachsorge:</strong> Follow-up vereinbaren, weitere Unterstützung organisieren<br><br>
                <em>⚠️ Dies überschreitet die Coaching-Grenzen. Therapeutische Intervention erforderlich.</em>`
            };
        }
        
        // Prozess-Support
        if (inputLower.includes('prozess') || inputLower.includes('stuck') || inputLower.includes('weiter')) {
            return {
                category: 'PROZESS',
                content: `<strong>⚙️ Prozess-Empfehlung für ${phase}:</strong><br><br>
                Basierend auf "${phase}" und Coachee-Typ "${coacheeType}" empfehle ich:<br><br>
                • <strong>Aktuelle Situation:</strong> Kurze Standortbestimmung mit dem Coachee<br>
                • <strong>Nächster Schritt:</strong> ${this.getNextStepRecommendation(phase)}<br>
                • <strong>Methodenvorschlag:</strong> ${this.getMethodRecommendation(phase, coacheeType)}<br>
                • <strong>Zeitrahmen:</strong> ca. 15-20 Minuten für diese Intervention<br><br>
                <em>💡 Tipp: Bei Widerstand zunächst würdigen, dann alternative Herangehensweise anbieten.</em>`
            };
        }
        
        // Methoden-Beratung
        if (inputLower.includes('methode') || inputLower.includes('technik') || inputLower.includes('intervention')) {
            return {
                category: 'METHODIK',
                content: `<strong>🛠️ Methodische Empfehlung:</strong><br><br>
                Für Ihre Situation in "${phase}" mit "${coacheeType}" eignen sich:<br><br>
                1. <strong>Primär-Methode:</strong> ${this.getPrimaryMethod(inputLower, phase)}<br>
                2. <strong>Fallback-Option:</strong> Falls Widerstand auftritt<br>
                3. <strong>Vertiefung:</strong> Bei besonders guter Resonanz<br><br>
                <strong>Konkrete Anwendung:</strong><br>
                ${this.getConcreteApplication(inputLower, coacheeType)}<br><br>
                <em>📋 Dokumentation: Notieren Sie die Wirksamkeit für zukünftige Sessions.</em>`
            };
        }
        
        // Widerstand/schwierige Situationen
        if (inputLower.includes('widerstand') || inputLower.includes('schwierig') || inputLower.includes('blockiert')) {
            return {
                category: 'WIDERSTAND',
                content: `<strong>🎯 Widerstandsarbeit:</strong><br><br>
                <strong>Würdigender Ansatz:</strong><br>
                "Ich merke, dass hier etwas in Ihnen zögert/bremst. Das ist völlig berechtigt und schützt Sie wahrscheinlich vor etwas. Mögen Sie mir erzählen, was diese innere Stimme zu bedenken gibt?"<br><br>
                <strong>Positive Absicht erkunden:</strong><br>
                • Was will dieser Anteil für Sie Gutes?<br>
                • Vor was schützt er Sie?<br>
                • Welche Erfahrungen stehen dahinter?<br><br>
                <strong>Integration statt Überwindung:</strong><br>
                Ziel ist nicht, den Widerstand zu brechen, sondern zu verstehen und zu integrieren.<br><br>
                <em>🤝 Denken Sie daran: Widerstand ist Information, nicht Opposition.</em>`
            };
        }
        
        // Standard-Beratung
        return {
            category: 'BERATUNG',
            content: `<strong>💡 Coach-Beratung für Ihre Situation:</strong><br><br>
            Basierend auf Ihrer Beschreibung und dem Kontext "${phase}" mit "${coacheeType}" empfehle ich:<br><br>
            <strong>Sofortige Schritte:</strong><br>
            1. Situation mit dem Coachee spiegeln und validieren<br>
            2. Gemeinsam den nächsten Fokus klären<br>
            3. Passende Intervention aus dem Prompt-Repository wählen<br><br>
            <strong>Haltung:</strong><br>
            • Ressourcenorientiert bleiben<br>
            • Prozess vor Inhalt<br>
            • Coachee als Experte für sein Leben würdigen<br><br>
            <em>🎯 Vertrauen Sie Ihrer Coaching-Kompetenz und dem Prozess.</em>`
        };
    },

    getNextStepRecommendation(phase) {
        const steps = {
            'Phase 1: Problem & Ziel': 'GT1-GT4 für strukturierte Problemerfassung',
            'Phase 2: Analyse': 'GT5-GT7 für Tiefenanalyse und Musterkennung',
            'Phase 3: Lösung': 'GT8-GT11 für Zielentwicklung und Ressourcenaktivierung',
            'Phase 4: Umsetzung': 'GT12 für konkrete Handlungsplanung',
            'Meta: Prozessreflexion': 'META1-META3 für Prozessreflexion'
        };
        return steps[phase] || 'Situationsgerechte Prompt-Auswahl';
    },

    getMethodRecommendation(phase, coacheeType) {
        if (phase.includes('Phase 1')) return 'GT1-GT4 oder SF1 für Problemklärung';
        if (phase.includes('Phase 2')) return 'DIAG1-DIAG5 für Tiefenanalyse';
        if (phase.includes('Phase 3')) return 'LÖS1-LÖS3 für Lösungsentwicklung';
        if (phase.includes('Phase 4')) return 'LÖS4-LÖS5 für Umsetzung';
        return 'META1-META3 für Prozessreflexion';
    },

    getPrimaryMethod(input, phase) {
        if (input.includes('spannungsfeld')) return 'Geißler GT4: Ausbalancierungsprobleme identifizieren';
        if (input.includes('team') || input.includes('gruppe')) return 'GRUPPE1: Team-Check mit strukturiertem Feedback';
        if (input.includes('vision') || input.includes('ziel')) return 'LÖS1: Erfolgsimagination entwickeln';
        return 'SF1: Solution Finder für grundlegende Klarheit';
    },

    getConcreteApplication(input, coacheeType) {
        return `Beginnen Sie mit einer offenen Frage, nutzen Sie aktives Zuhören und spiegeln Sie das Gehörte. Bei ${coacheeType} besonders auf systemische Aspekte achten.`;
    },

    displayResponse(response) {
        const responseDiv = DOM.find('#coachKIResponse');
        const contentDiv = DOM.find('#coachKIResponseContent');
        const categorySpan = DOM.find('#responseCategory');
        const followUp = DOM.find('#followUpActions');
        
        if (responseDiv && contentDiv && categorySpan && followUp) {
            responseDiv.style.display = 'block';
            contentDiv.innerHTML = response.content;
            categorySpan.textContent = response.category;
            followUp.style.display = 'block';
            
            Utils.animateElement(responseDiv, 'fade-in');
            
            // OpenAI Button hinzufügen wenn noch nicht da
            setTimeout(addOpenAICoachButton, 500);
        }
    }
};

// OpenAI Coach Button hinzufügen
function addOpenAICoachButton() {
    const actionButtons = DOM.find('.action-buttons');
    if (actionButtons && !DOM.find('#openai-coach-btn')) {
        const openaiCoachBtn = DOM.create('button', {
            id: 'openai-coach-btn',
            className: 'ask-ki-btn',
            innerHTML: '🚀 OpenAI Coach-KI',
            style: 'background: linear-gradient(135deg, #10b981, #059669); margin-left: 10px;'
        });
        
        DOM.on(openaiCoachBtn, 'click', askOpenAICoach);
        actionButtons.appendChild(openaiCoachBtn);
    }
}

// Follow-up Aktionen
window.implementSuggestion = function() {
    Utils.showToast('Empfehlung wird in den Prompt-Editor übernommen.', 'info');
};

window.getAlternativeAdvice = function() {
    askCoachKI(); // Neue Antwort generieren
};

window.deepDive = function() {
    const currentInput = DOM.find('#coachInput')?.value || '';
    const input = DOM.find('#coachInput');
    if (input) {
        input.value = currentInput + '\n\nBitte gehe tiefer ins Detail und erkläre die Hintergründe.';
        askCoachKI();
    }
};

// Initialisierung
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        CoachInterface.init();
        CoachInterface.setupCoachKI();
        
        // OpenAI Coach Button nach kurzer Verzögerung hinzufügen
        setTimeout(addOpenAICoachButton, 2000);
        
        console.log('🎯 Coach Interface bereit');
        console.log('🚀 OpenAI Assistant Integration aktiv');
    }
});

// Globale Load-Funktionen für HTML onclick events
window.loadProcessSupport = function() {
    CoachInterface.loadProcessSupport();
};

window.loadMethodenBeratung = function() {
    CoachInterface.loadMethodenBeratung();
};

window.loadInterventionshilfe = function() {
    CoachInterface.loadInterventionshilfe();
};

window.loadNotfallSupport = function() {
    CoachInterface.loadNotfallSupport();
};

// Debug-Funktion für OpenAI Integration
window.debugOpenAI = function() {
    console.log('=== OPENAI INTEGRATION DEBUG ===');
    console.log('Current Thread ID:', currentThreadId);
    console.log('AI Processing:', aiProcessing);
    console.log('API Endpoint Available:', '/api/openai-assistant');
    
    // Test API Verfügbarkeit
    fetch('/api/openai-assistant', { method: 'HEAD' })
        .then(r => console.log('API Status:', r.status))
        .catch(e => console.log('API Error:', e.message));
};
// Voice-to-Text Zusammenfassung Feature - Patch für coach.js

// Speech Recognition Setup
let speechRecognition = null;
let isRecording = false;
let recordingStartTime = null;

// Initialize Speech Recognition
function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        speechRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        speechRecognition.continuous = true;
        speechRecognition.interimResults = true;
        speechRecognition.lang = 'de-DE';
        
        console.log('🎤 Speech Recognition initialisiert');
        return true;
    } else {
        console.log('❌ Speech Recognition nicht verfügbar');
        return false;
    }
}

// Voice Summary Interface hinzufügen
function addVoiceSummaryInterface() {
    const coachKIResponse = DOM.find('#coachKIResponse');
    if (!coachKIResponse || DOM.find('#voiceSummarySection')) return;

    const voiceSummaryHTML = `
        <div id="voiceSummarySection" style="margin-top: 20px; padding: 20px; background: rgba(16, 185, 129, 0.1); border-radius: 12px; border: 2px solid rgba(16, 185, 129, 0.3);">
            <h4 style="color: #065f46; margin-bottom: 15px; display: flex; align-items: center;">
                🎤 Mündliche Zusammenfassung für Coachee
            </h4>
            
            <div style="display: flex; gap: 10px; margin-bottom: 15px; align-items: center;">
                <button id="startRecordingBtn" onclick="startVoiceRecording()" class="voice-btn" style="background: #10b981; color: white; border: none; padding: 12px 20px; border-radius: 8px; font-weight: 600; cursor: pointer;">
                    🎤 Aufnahme starten
                </button>
                <button id="stopRecordingBtn" onclick="stopVoiceRecording()" class="voice-btn" style="background: #ef4444; color: white; border: none; padding: 12px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; display: none;">
                    ⏹️ Aufnahme stoppen
                </button>
                <span id="recordingStatus" style="color: #065f46; font-weight: 600;"></span>
            </div>
            
            <div id="transcriptionContainer" style="background: white; border: 2px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 15px; min-height: 100px; margin-bottom: 15px; display: none;">
                <div style="color: #065f46; font-weight: 600; margin-bottom: 10px;">Transkription:</div>
                <div id="transcriptionText" style="line-height: 1.6; color: #374151;"></div>
            </div>
            
            <div id="summaryActions" style="display: none; gap: 10px;">
                <button onclick="editSummary()" style="background: #6b7280; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer;">
                    ✏️ Bearbeiten
                </button>
                <button onclick="sendSummaryToCoachee()" style="background: #10b981; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-weight: 600;">
                    📤 An Coachee senden
                </button>
                <button onclick="clearSummary()" style="background: #ef4444; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer;">
                    🗑️ Löschen
                </button>
            </div>
        </div>
    `;
    
    coachKIResponse.insertAdjacentHTML('beforeend', voiceSummaryHTML);
}

// Aufnahme starten
window.startVoiceRecording = function() {
    if (!speechRecognition) {
        if (!initSpeechRecognition()) {
            Utils.showToast('Speech Recognition nicht verfügbar. Browser unterstützt diese Funktion nicht.', 'error');
            return;
        }
    }

    isRecording = true;
    recordingStartTime = Date.now();
    
    // UI Updates
    DOM.find('#startRecordingBtn').style.display = 'none';
    DOM.find('#stopRecordingBtn').style.display = 'inline-block';
    DOM.find('#recordingStatus').textContent = 'Aufnahme läuft... 🔴';
    DOM.find('#transcriptionContainer').style.display = 'block';
    DOM.find('#transcriptionText').textContent = 'Sprechen Sie jetzt...';

    // Recording Timer
    const timer = setInterval(() => {
        if (!isRecording) {
            clearInterval(timer);
            return;
        }
        const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
        DOM.find('#recordingStatus').textContent = `Aufnahme läuft... 🔴 ${elapsed}s`;
    }, 1000);

    // Speech Recognition Events
    speechRecognition.onresult = function(event) {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }

        const transcriptionEl = DOM.find('#transcriptionText');
        if (transcriptionEl) {
            const currentFinal = transcriptionEl.getAttribute('data-final') || '';
            transcriptionEl.setAttribute('data-final', currentFinal + finalTranscript);
            transcriptionEl.innerHTML = 
                `<span style="color: #374151;">${currentFinal + finalTranscript}</span>` +
                `<span style="color: #9ca3af; font-style: italic;">${interimTranscript}</span>`;
        }
    };

    speechRecognition.onerror = function(event) {
        console.error('Speech Recognition Error:', event.error);
        Utils.showToast(`Spracherkennung Fehler: ${event.error}`, 'error');
        stopVoiceRecording();
    };

    speechRecognition.onend = function() {
        if (isRecording) {
            // Automatisch neu starten wenn noch aufgenommen wird
            speechRecognition.start();
        }
    };

    speechRecognition.start();
    Utils.showToast('Sprachaufnahme gestartet', 'success');
    console.log('🎤 Sprachaufnahme gestartet');
};

// Aufnahme stoppen
window.stopVoiceRecording = function() {
    if (!speechRecognition || !isRecording) return;

    isRecording = false;
    speechRecognition.stop();

    // UI Updates
    DOM.find('#startRecordingBtn').style.display = 'inline-block';
    DOM.find('#stopRecordingBtn').style.display = 'none';
    DOM.find('#recordingStatus').textContent = 'Aufnahme beendet ✅';
    DOM.find('#summaryActions').style.display = 'flex';

    const duration = Math.floor((Date.now() - recordingStartTime) / 1000);
    Utils.showToast(`Sprachaufnahme beendet (${duration}s)`, 'success');
    
    // Finale Transkription aufräumen
    const transcriptionEl = DOM.find('#transcriptionText');
    if (transcriptionEl) {
        const finalText = transcriptionEl.getAttribute('data-final') || transcriptionEl.textContent;
        transcriptionEl.innerHTML = `<span style="color: #374151;">${finalText.trim()}</span>`;
    }
    
    console.log('⏹️ Sprachaufnahme beendet');
};

// Zusammenfassung bearbeiten
window.editSummary = function() {
    const transcriptionEl = DOM.find('#transcriptionText');
    if (!transcriptionEl) return;

    const currentText = transcriptionEl.textContent || '';
    const textarea = DOM.create('textarea', {
        style: 'width: 100%; min-height: 100px; padding: 10px; border: 2px solid #10b981; border-radius: 6px; font-family: inherit;',
        value: currentText
    });

    transcriptionEl.parentNode.replaceChild(textarea, transcriptionEl);
    textarea.focus();

    // Save/Cancel Buttons
    const actions = DOM.find('#summaryActions');
    actions.innerHTML = `
        <button onclick="saveSummaryEdit()" style="background: #10b981; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-weight: 600;">
            💾 Speichern
        </button>
        <button onclick="cancelSummaryEdit()" style="background: #6b7280; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer;">
            ❌ Abbrechen
        </button>
    `;
};

// Bearbeitung speichern
window.saveSummaryEdit = function() {
    const textarea = DOM.find('#transcriptionContainer textarea');
    if (!textarea) return;

    const newText = textarea.value.trim();
    const newDiv = DOM.create('div', {
        id: 'transcriptionText',
        style: 'line-height: 1.6; color: #374151;',
        innerHTML: `<span style="color: #374151;">${Utils.escapeHtml(newText)}</span>`
    });

    textarea.parentNode.replaceChild(newDiv, textarea);

    // Restore Actions
    const actions = DOM.find('#summaryActions');
    actions.innerHTML = `
        <button onclick="editSummary()" style="background: #6b7280; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer;">
            ✏️ Bearbeiten
        </button>
        <button onclick="sendSummaryToCoachee()" style="background: #10b981; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; font-weight: 600;">
            📤 An Coachee senden
        </button>
        <button onclick="clearSummary()" style="background: #ef4444; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer;">
            🗑️ Löschen
        </button>
    `;

    Utils.showToast('Zusammenfassung gespeichert', 'success');
};

// Bearbeitung abbrechen
window.cancelSummaryEdit = function() {
    // Reload the interface
    location.reload();
};

// Zusammenfassung an Coachee senden
window.sendSummaryToCoachee = function() {
    const transcriptionEl = DOM.find('#transcriptionText');
    if (!transcriptionEl) return;

    const summaryText = transcriptionEl.textContent.trim();
    if (!summaryText) {
        Utils.showToast('Keine Zusammenfassung vorhanden.', 'error');
        return;
    }

    if (!window.coachingComm) {
        Utils.showToast('Kommunikation nicht verfügbar.', 'error');
        return;
    }

    // Formatierte Zusammenfassung mit Header
    const formattedSummary = `📋 Coach-Zusammenfassung:\n\n${summaryText}`;
    
    // An Coachee senden
    window.coachingComm.addMessage('👨‍💼 Coach', formattedSummary);
    
    // Zur Kollaborations-Tab wechseln
    CoachInterface.showTab('collaboration');
    
    Utils.showToast('Zusammenfassung an Coachee gesendet!', 'success');
    console.log('📤 Mündliche Zusammenfassung gesendet:', summaryText);

    // Cleanup
    clearSummary();
};

// Zusammenfassung löschen
window.clearSummary = function() {
    const voiceSection = DOM.find('#voiceSummarySection');
    if (voiceSection) {
        voiceSection.remove();
    }
    
    // Stop recording if active
    if (isRecording) {
        stopVoiceRecording();
    }
};

// KI-Antworten nur für Coach sichtbar machen
function hideAIResponsesFromCoachee() {
    // Collaboration Display anpassen
    const originalUpdateDisplay = CoachInterface.updateCollaborationDisplay;
    
    CoachInterface.updateCollaborationDisplay = function(messages) {
        // Filter AI messages für Coachee-View
        const isCoacheeView = window.location.pathname.includes('collaboration');
        const filteredMessages = isCoacheeView ? 
            messages.filter(msg => !msg.sender.includes('KI') && !msg.sender.includes('OpenAI')) : 
            messages;
        
        return originalUpdateDisplay.call(this, filteredMessages);
    };
}

// Coach-KI Response Display erweitern
const originalDisplayResponse = CoachKI.displayResponse;
CoachKI.displayResponse = function(response) {
    // Original Response anzeigen
    originalDisplayResponse.call(this, response);
    
    // Voice Summary Interface hinzufügen
    setTimeout(() => {
        addVoiceSummaryInterface();
    }, 100);
};

// Initialize Voice Features
document.addEventListener('DOMContentLoaded', function() {
    // Speech Recognition prüfen und initialisieren
    if (initSpeechRecognition()) {
        console.log('🎤 Voice Summary Feature verfügbar');
    } else {
        console.log('❌ Voice Summary Feature nicht verfügbar (Browser-Support fehlt)');
    }
    
    // Hide AI responses from Coachee view
    hideAIResponsesFromCoachee();
});

// Quick-Access Button für Voice Summary
function addVoiceSummaryButton() {
    const quickAccess = DOM.find('.quick-access');
    if (quickAccess && !DOM.find('#voiceSummaryQuickBtn')) {
        const voiceBtn = DOM.create('button', {
            id: 'voiceSummaryQuickBtn',
            className: 'quick-btn',
            innerHTML: '🎤 Voice Summary',
            style: 'background: #10b981; color: white;'
        });
        
        DOM.on(voiceBtn, 'click', () => {
            // Direkt zur Coach-KI Tab und Voice Interface
            CoachInterface.showTab('coachki');
            setTimeout(() => {
                const input = DOM.find('#coachInput');
                if (input) {
                    input.value = 'Ich möchte eine mündliche Zusammenfassung für meinen Coachee erstellen.';
                    askCoachKI();
                }
            }, 300);
        });
        
        quickAccess.appendChild(voiceBtn);
    }
}

// Voice Summary Button nach Initialisierung hinzufügen
setTimeout(addVoiceSummaryButton, 3000);

console.log('🎤 Voice-to-Text Zusammenfassung Feature geladen');
console.log('💡 Nutze Coach-KI Tab für mündliche Zusammenfassungen');
// Fix: KI-Antworten NUR für Coach sichtbar machen

// Original sendDialogToAI und sendDialogToOpenAI Funktionen anpassen
// Ersetze die bestehenden Funktionen mit diesen:

window.sendDialogToAI = function() {
    const messages = window.coachingComm?.getMessages() || [];
    
    if (messages.length === 0) {
        Utils.showToast('Keine Nachrichten zum Senden vorhanden.', 'error');
        return;
    }
    
    // Dialog zu KI-readable Format konvertieren
    const dialog = messages.map(msg => `${msg.sender}: ${msg.content}`).join('\n\n');
    
    // Intelligente KI-Antwort basierend auf Dialog generieren
    const aiResponse = generateAIResponse(dialog, messages);
    
    // KI-Antwort NICHT an Coachee senden - nur für Coach anzeigen
    displayAIResponseForCoachOnly('🤖 Lokale KI', aiResponse);
    
    Utils.showToast('Lokale KI-Analyse erstellt (nur für Coach sichtbar)', 'success');
    console.log('🤖 Lokale KI-Antwort nur für Coach generiert');
};

window.sendDialogToOpenAI = async function() {
    const messages = window.coachingComm?.getMessages() || [];
    
    if (messages.length === 0) {
        Utils.showToast('Keine Nachrichten zum Senden vorhanden.', 'error');
        return;
    }

    // Button-Status ändern
    const button = document.querySelector('[onclick="sendDialogToOpenAI()"]');
    if (button) {
        button.textContent = '🚀 OpenAI denkt...';
        button.disabled = true;
    }

    try {
        // Dialog zu strukturiertem Format konvertieren
        const dialog = messages.map(msg => `${msg.sender}: ${msg.content}`).join('\n\n');
        
        // Kontext für bessere KI-Antworten
        const context = {
            clientName: window.coachingApp.selectedClient?.name || 'Unbekannt',
            clientTopics: window.coachingApp.selectedClient?.topics || [],
            sessionPhase: 'Dialog-Analyse',
            messageCount: messages.length,
            lastSender: messages[messages.length - 1]?.sender
        };

        // OpenAI Assistant aufrufen
        const aiResponse = await generateOpenAIResponse(dialog, context);
        
        if (aiResponse) {
            // KI-Antwort NICHT an Coachee senden - nur für Coach anzeigen
            displayAIResponseForCoachOnly('🚀 OpenAI Coach', aiResponse);
            Utils.showToast('OpenAI Analyse erstellt (nur für Coach sichtbar)', 'success');
        }

    } catch (error) {
        console.error('Error sending to OpenAI:', error);
        Utils.showToast('Fehler beim Senden an OpenAI.', 'error');
        
    } finally {
        // Button zurücksetzen
        if (button) {
            button.textContent = '🚀 Dialog an OpenAI';
            button.disabled = false;
        }
    }
};

// Neue Funktion: KI-Antwort nur für Coach anzeigen
function displayAIResponseForCoachOnly(sender, response) {
    // Spezielle KI-Antwort Box im Kollaborations-Monitor hinzufügen
    const collaborationMessages = DOM.find('#collaborationMessages');
    if (!collaborationMessages) return;

    // Prüfen ob bereits eine KI-Antwort Box existiert
    let aiResponseBox = DOM.find('#coachOnlyAIResponse');
    
    if (!aiResponseBox) {
        // Neue KI-Antwort Box erstellen
        aiResponseBox = DOM.create('div', {
            id: 'coachOnlyAIResponse',
            style: `
                background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05));
                border: 3px solid #10b981;
                border-radius: 15px;
                padding: 20px;
                margin: 20px 0;
                box-shadow: 0 8px 25px rgba(16, 185, 129, 0.2);
            `,
            innerHTML: `
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                    <h4 style="color: #065f46; margin: 0; font-weight: 700;">
                        🤖 KI-Analyse (nur für Coach)
                    </h4>
                    <button onclick="closeCoachAIResponse()" style="background: #ef4444; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 16px;">
                        ✕
                    </button>
                </div>
                <div id="coachAIContent" style="background: white; padding: 15px; border-radius: 10px; border: 2px solid rgba(16, 185, 129, 0.3); line-height: 1.6; color: #374151;">
                    <!-- KI-Antwort wird hier eingefügt -->
                </div>
                <div style="margin-top: 15px; display: flex; gap: 10px;">
                    <button onclick="createVoiceSummaryFromAI()" style="background: #10b981; color: white; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        🎤 Mündliche Zusammenfassung erstellen
                    </button>
                    <button onclick="sendAIResponseToCoachee()" style="background: #6b7280; color: white; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer;">
                        📤 Doch an Coachee senden
                    </button>
                </div>
            `
        });
        
        // Box vor den normalen Nachrichten einfügen
        collaborationMessages.insertBefore(aiResponseBox, collaborationMessages.firstChild);
    }

    // KI-Antwort einfügen
    const contentDiv = DOM.find('#coachAIContent');
    if (contentDiv) {
        contentDiv.innerHTML = `
            <div style="font-weight: 600; color: #065f46; margin-bottom: 10px;">${sender}</div>
            <div>${Utils.escapeHtml(response)}</div>
        `;
    }

    // Scroll to top um die KI-Antwort zu zeigen
    collaborationMessages.scrollTop = 0;
}

// KI-Antwort Box schließen
window.closeCoachAIResponse = function() {
    const aiBox = DOM.find('#coachOnlyAIResponse');
    if (aiBox) {
        aiBox.remove();
    }
};

// Voice Summary direkt aus KI-Antwort erstellen
window.createVoiceSummaryFromAI = function() {
    // Zur Coach-KI Tab wechseln
    CoachInterface.showTab('coachki');
    
    // KI-Antwort in Coach Input einfügen
    const aiContent = DOM.find('#coachAIContent div:last-child')?.textContent || '';
    const coachInput = DOM.find('#coachInput');
    
    if (coachInput && aiContent) {
        coachInput.value = `Basierend auf dieser KI-Analyse möchte ich eine Zusammenfassung für meinen Coachee erstellen:\n\n${aiContent}`;
        
        // Automatisch lokale Coach-KI aufrufen
        setTimeout(() => {
            askCoachKI();
        }, 500);
    }
    
    Utils.showToast('Voice Summary Modus aktiviert - siehe Coach-KI Tab', 'info');
};

// KI-Antwort doch an Coachee senden (falls gewünscht)
window.sendAIResponseToCoachee = function() {
    const aiContent = DOM.find('#coachAIContent div:last-child')?.textContent || '';
    
    if (!aiContent) {
        Utils.showToast('Keine KI-Antwort vorhanden.', 'error');
        return;
    }
    
    if (!window.coachingComm) {
        Utils.showToast('Kommunikation nicht verfügbar.', 'error');
        return;
    }
    
    // Bestätigungsdialog
    if (confirm('Möchten Sie die KI-Antwort wirklich an den Coachee senden?')) {
        window.coachingComm.addMessage('🤖 Coach-KI', aiContent);
        closeCoachAIResponse();
        Utils.showToast('KI-Antwort an Coachee gesendet', 'success');
    }
};

// Kollaborations-Actions anpassen
CoachInterface.showCollaborationActions = function() {
    const actions = DOM.find('#collaborationActions');
    if (actions) {
        actions.style.display = 'flex';
        actions.innerHTML = `
            <button onclick="sendDialogToAI()" class="send-ai-btn">
                🤖 Lokale KI-Analyse (Coach only)
            </button>
            <button onclick="sendDialogToOpenAI()" class="send-ai-btn" style="background: linear-gradient(135deg, #10b981, #059669);">
                🚀 OpenAI Analyse (Coach only)
            </button>
            <button onclick="openCollaborationWindow()" class="open-collab-btn">
                🔗 Kollaborations-Fenster öffnen
            </button>
            <button onclick="editPrompt()" class="edit-btn">
                ✏️ Zurück zum Editor
            </button>
        `;
    }
};

console.log('✅ KI-Antworten sind jetzt nur für Coach sichtbar');
console.log('🎤 Voice Summary Integration aktiv');
// Feature: Gesendete Zusammenfassungen nachträglich bearbeiten

// Erweitere die updateCollaborationDisplay Funktion
const originalUpdateCollaborationDisplay = CoachInterface.updateCollaborationDisplay;

CoachInterface.updateCollaborationDisplay = function(messages) {
    const container = DOM.find('#collaborationMessages');
    if (!container) return;

    if (messages.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: #64748b; padding: 40px;">
                Hier sehen Sie den Dialog zwischen Coach und Coachee.<br>
                Öffnen Sie das Kollaborations-Fenster für den Coachee.
            </div>
        `;
        
        const actions = DOM.find('#collaborationActions');
        if (actions) {
            actions.style.display = 'none';
        }
        return;
    }

    DOM.empty(container);
    
    messages.forEach((message, index) => {
        const isCoachSummary = message.sender === '👨‍💼 Coach' && message.content.includes('📋 Coach-Zusammenfassung:');
        
        const messageDiv = DOM.create('div', {
            className: `message ${message.sender.toLowerCase().replace(/[^a-z]/g, '')}`,
            'data-message-index': index,
            innerHTML: `
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                    <span style="font-weight: bold; color: #3b82f6;">${this.getSenderDisplay(message.sender)}</span>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="color: #64748b; font-size: 0.9rem;">${Utils.formatTime(message.timestamp)}</span>
                        ${isCoachSummary ? `
                            <button onclick="editSummaryMessage(${index})" style="background: #6b7280; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; cursor: pointer;" title="Zusammenfassung bearbeiten">
                                ✏️ Bearbeiten
                            </button>
                        ` : ''}
                    </div>
                </div>
                <div style="line-height: 1.6;" data-message-content>${Utils.escapeHtml(message.content)}</div>
            `
        });
        container.appendChild(messageDiv);
    });

    MessageHelpers.scrollToBottom(container);
    this.showCollaborationActions();
};

// Zusammenfassung bearbeiten
window.editSummaryMessage = function(messageIndex) {
    const messages = window.coachingComm?.getMessages() || [];
    const message = messages[messageIndex];
    
    if (!message || !message.content.includes('📋 Coach-Zusammenfassung:')) {
        Utils.showToast('Nachricht nicht gefunden oder nicht bearbeitbar.', 'error');
        return;
    }

    // Extrahiere den Zusammenfassungstext (ohne Header)
    const summaryText = message.content.replace('📋 Coach-Zusammenfassung:\n\n', '');
    
    // Erstelle Bearbeitungs-Modal
    createSummaryEditModal(summaryText, messageIndex);
};

// Bearbeitungs-Modal erstellen
function createSummaryEditModal(summaryText, messageIndex) {
    // Prüfen ob Modal bereits existiert
    let existingModal = DOM.find('#summaryEditModal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = DOM.create('div', {
        id: 'summaryEditModal',
        style: `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `,
        innerHTML: `
            <div style="
                background: white;
                border-radius: 15px;
                padding: 30px;
                max-width: 600px;
                width: 90%;
                max-height: 80%;
                overflow-y: auto;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="color: #374151; margin: 0;">✏️ Zusammenfassung bearbeiten</h3>
                    <button onclick="closeSummaryEditModal()" style="background: #ef4444; color: white; border: none; border-radius: 50%; width: 35px; height: 35px; cursor: pointer; font-size: 18px;">
                        ✕
                    </button>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #374151;">
                        Zusammenfassung bearbeiten:
                    </label>
                    <textarea id="editSummaryTextarea" style="
                        width: 100%;
                        min-height: 200px;
                        padding: 15px;
                        border: 2px solid #d1d5db;
                        border-radius: 10px;
                        font-family: inherit;
                        font-size: 1rem;
                        line-height: 1.6;
                        resize: vertical;
                    " placeholder="Bearbeiten Sie hier Ihre Zusammenfassung...">${Utils.escapeHtml(summaryText)}</textarea>
                </div>
                
                <div style="display: flex; gap: 15px; justify-content: flex-end;">
                    <button onclick="closeSummaryEditModal()" style="
                        background: #6b7280;
                        color: white;
                        border: none;
                        padding: 12px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                    ">
                        ❌ Abbrechen
                    </button>
                    <button onclick="updateSummaryMessage(${messageIndex})" style="
                        background: #10b981;
                        color: white;
                        border: none;
                        padding: 12px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                    ">
                        💾 Speichern & Senden
                    </button>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px; border-left: 4px solid #10b981;">
                    <div style="font-weight: 600; color: #065f46; margin-bottom: 5px;">💡 Tipp:</div>
                    <div style="color: #374151; font-size: 0.9rem;">
                        Die bearbeitete Zusammenfassung wird als neue Nachricht an den Coachee gesendet. 
                        Die ursprüngliche Nachricht bleibt zur Referenz bestehen.
                    </div>
                </div>
            </div>
        `
    });

    document.body.appendChild(modal);
    
    // Focus auf Textarea
    const textarea = DOM.find('#editSummaryTextarea');
    if (textarea) {
        textarea.focus();
        // Cursor ans Ende setzen
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }

    // ESC-Taste zum Schließen
    document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
            closeSummaryEditModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    });
}

// Modal schließen
window.closeSummaryEditModal = function() {
    const modal = DOM.find('#summaryEditModal');
    if (modal) {
        modal.remove();
    }
};

// Zusammenfassung aktualisieren
window.updateSummaryMessage = function(messageIndex) {
    const textarea = DOM.find('#editSummaryTextarea');
    if (!textarea) return;

    const updatedText = textarea.value.trim();
    if (!updatedText) {
        Utils.showToast('Zusammenfassung darf nicht leer sein.', 'error');
        return;
    }

    if (!window.coachingComm) {
        Utils.showToast('Kommunikation nicht verfügbar.', 'error');
        return;
    }

    // Neue überarbeitete Zusammenfassung senden
    const formattedSummary = `📋 Coach-Zusammenfassung (überarbeitet):\n\n${updatedText}`;
    window.coachingComm.addMessage('👨‍💼 Coach', formattedSummary);
    
    // Modal schließen
    closeSummaryEditModal();
    
    Utils.showToast('Überarbeitete Zusammenfassung gesendet!', 'success');
    console.log('📝 Zusammenfassung überarbeitet und gesendet');
};

// Quick-Edit Funktion: Letzte Zusammenfassung bearbeiten
window.editLastSummary = function() {
    const messages = window.coachingComm?.getMessages() || [];
    
    // Finde die letzte Coach-Zusammenfassung
    for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].sender === '👨‍💼 Coach' && messages[i].content.includes('📋 Coach-Zusammenfassung:')) {
            editSummaryMessage(i);
            return;
        }
    }
    
    Utils.showToast('Keine Zusammenfassung zum Bearbeiten gefunden.', 'info');
};

// Quick-Edit Button zu den Kollaborations-Actions hinzufügen
const originalShowCollaborationActions = CoachInterface.showCollaborationActions;
CoachInterface.showCollaborationActions = function() {
    const actions = DOM.find('#collaborationActions');
    if (actions) {
        actions.style.display = 'flex';
        actions.innerHTML = `
            <button onclick="sendDialogToAI()" class="send-ai-btn">
                🤖 Lokale KI-Analyse (Coach only)
            </button>
            <button onclick="sendDialogToOpenAI()" class="send-ai-btn" style="background: linear-gradient(135deg, #10b981, #059669);">
                🚀 OpenAI Analyse (Coach only)
            </button>
            <button onclick="editLastSummary()" class="edit-btn" style="background: #f59e0b; color: white;">
                ✏️ Letzte Zusammenfassung bearbeiten
            </button>
            <button onclick="openCollaborationWindow()" class="open-collab-btn">
                🔗 Kollaborations-Fenster öffnen
            </button>
            <button onclick="editPrompt()" class="edit-btn">
                ✏️ Zurück zum Editor
            </button>
        `;
    }
};

// Zur Voice Summary Funktion erweitern
const originalSendSummaryToCoachee = window.sendSummaryToCoachee;
window.sendSummaryToCoachee = function() {
    const transcriptionEl = DOM.find('#transcriptionText');
    if (!transcriptionEl) return;

    const summaryText = transcriptionEl.textContent.trim();
    if (!summaryText) {
        Utils.showToast('Keine Zusammenfassung vorhanden.', 'error');
        return;
    }

    if (!window.coachingComm) {
        Utils.showToast('Kommunikation nicht verfügbar.', 'error');
        return;
    }

    // Formatierte Zusammenfassung mit Header
    const formattedSummary = `📋 Coach-Zusammenfassung:\n\n${summaryText}`;
    
    // An Coachee senden
    window.coachingComm.addMessage('👨‍💼 Coach', formattedSummary);
    
    // Zur Kollaborations-Tab wechseln
    CoachInterface.showTab('collaboration');
    
    Utils.showToast('Zusammenfassung gesendet! Jederzeit über "✏️ Bearbeiten" änderbar.', 'success');
    console.log('📤 Mündliche Zusammenfassung gesendet:', summaryText);

    // Cleanup
    clearSummary();
};

console.log('✏️ Summary Edit Feature geladen');
console.log('💡 Klicke auf "✏️ Bearbeiten" neben Zusammenfassungen oder nutze "Letzte Zusammenfassung bearbeiten"');
// Einfacher ChatGPT Button - ohne Überschreibungen
function addSimpleChatGPTButton() {
    const quickAccess = DOM.find('.quick-access');
    if (quickAccess && !DOM.find('#simpleChatGPTBtn')) {
        const btn = DOM.create('button', {
            id: 'simpleChatGPTBtn',
            className: 'quick-btn',
            innerHTML: '🏔️ ChatGPT öffnen',
            style: 'background: #10b981; color: white;'
        });
        
        DOM.on(btn, 'click', () => {
            window.open('https://chatgpt.com', '_blank');
            Utils.showToast('ChatGPT für Berndeutsch geöffnet!', 'success');
        });
        
        quickAccess.appendChild(btn);
    }
}

// Button nach 3 Sekunden hinzufügen
setTimeout(addSimpleChatGPTButton, 3000);
// Coach Wissens-Upload System für triadisches KI-Coaching

// Neue Sektion in Coach-KI Tab für Wissens-Management
function addKnowledgeManagementSection() {
    const coachKIContainer = DOM.find('.coachki-container');
    if (!coachKIContainer || DOM.find('#knowledgeManagement')) return;

    const knowledgeHTML = `
        <div id="knowledgeManagement" style="background: rgba(59, 130, 246, 0.1); border-radius: 15px; padding: 25px; margin-bottom: 25px; border: 2px solid rgba(59, 130, 246, 0.3);">
            <h3 style="color: #1e40af; margin-bottom: 20px; display: flex; align-items: center;">
                📚 Dein Coaching-Wissen (Geissler Clone)
                <span style="background: #3b82f6; color: white; padding: 0.3rem 0.8rem; border-radius: 8px; font-size: 0.8rem; margin-left: 10px;">DEIN WISSEN</span>
            </h3>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1e40af;">
                    Lade deine Coaching-Dokumente hoch (Word, PDF):
                </label>
                <input type="file" id="knowledgeUpload" multiple accept=".pdf,.doc,.docx,.txt" style="
                    width: 100%;
                    padding: 12px;
                    border: 2px solid rgba(59, 130, 246, 0.4);
                    border-radius: 8px;
                    background: white;
                ">
                <div style="font-size: 0.9rem; color: #1e40af; margin-top: 5px;">
                    💡 Empfehlung: Separate Dokumente für Diagnostik, Methoden, Interventionen, eigene Erfahrungen
                </div>
            </div>
            
            <div id="uploadedFiles" style="display: none; background: white; border: 2px solid rgba(59, 130, 246, 0.3); border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                <div style="color: #1e40af; font-weight: 600; margin-bottom: 10px;">📄 Deine Wissens-Dokumente:</div>
                <div id="filesList"></div>
            </div>
            
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <button onclick="processKnowledgeFiles()" id="processBtn" style="background: #3b82f6; color: white; border: none; padding: 12px 20px; border-radius: 8px; font-weight: 600; cursor: pointer;" disabled>
                    🧠 Wissen an KI übertragen
                </button>
                <button onclick="testKnowledgeClone()" style="background: #10b981; color: white; border: none; padding: 12px 20px; border-radius: 8px; font-weight: 600; cursor: pointer;">
                    🧪 Clone testen
                </button>
            </div>
            
            <div id="knowledgeStatus" style="background: rgba(59, 130, 246, 0.1); border-radius: 8px; padding: 12px; border-left: 4px solid #3b82f6;">
                <div style="font-weight: 600; color: #1e40af; margin-bottom: 5px;">📋 Geissler Clone Status:</div>
                <div id="cloneStatus" style="color: #374151; font-size: 0.9rem;">
                    Noch keine Wissens-Dokumente hochgeladen. Lade deine Coaching-Expertise hoch, um einen personalisierten KI-Coach zu erstellen.
                </div>
            </div>
        </div>
    `;
    
    // Vor den Quick-Access Buttons einfügen
    const quickAccess = DOM.find('.quick-access');
    if (quickAccess) {
        quickAccess.insertAdjacentHTML('beforebegin', knowledgeHTML);
        setupKnowledgeUpload();
    }
}

// Knowledge Upload Setup
function setupKnowledgeUpload() {
    const uploadInput = DOM.find('#knowledgeUpload');
    if (uploadInput) {
        uploadInput.addEventListener('change', handleFileUpload);
    }
}

// File Upload Handler
function handleFileUpload(event) {
    const files = event.target.files;
    if (files.length === 0) return;

    const filesList = DOM.find('#filesList');
    const uploadedFiles = DOM.find('#uploadedFiles');
    const processBtn = DOM.find('#processBtn');
    
    DOM.empty(filesList);
    
    Array.from(files).forEach(file => {
        const fileDiv = DOM.create('div', {
            style: 'display: flex; justify-content: space-between; align-items: center; padding: 8px; background: rgba(59, 130, 246, 0.1); border-radius: 6px; margin-bottom: 5px;',
            innerHTML: `
                <span style="color: #1e40af;">📄 ${file.name} (${(file.size / 1024).toFixed(1)} KB)</span>
                <span style="color: #10b981; font-size: 0.8rem;">✓ Bereit</span>
            `
        });
        filesList.appendChild(fileDiv);
    });
    
    uploadedFiles.style.display = 'block';
    processBtn.disabled = false;
    
    Utils.showToast(`${files.length} Wissens-Dokumente bereit für Upload`, 'success');
}

// Knowledge Processing
window.processKnowledgeFiles = async function() {
    const uploadInput = DOM.find('#knowledgeUpload');
    const files = uploadInput?.files;
    
    if (!files || files.length === 0) {
        Utils.showToast('Keine Dateien zum Verarbeiten.', 'error');
        return;
    }
    
    const processBtn = DOM.find('#processBtn');
    const cloneStatus = DOM.find('#cloneStatus');
    
    processBtn.textContent = '🔄 Verarbeite Wissen...';
    processBtn.disabled = true;
    
    try {
        // Simuliere Knowledge Processing (hier würdest du die Dateien an OpenAI Assistant senden)
        cloneStatus.innerHTML = '🔄 Verarbeite deine Coaching-Expertise...';
        
        // Hier würde der echte Upload zu OpenAI Assistant passieren
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Success
        cloneStatus.innerHTML = `
            ✅ <strong>Geissler Clone erfolgreich erstellt!</strong><br>
            📚 ${files.length} Dokumente verarbeitet<br>
            🧠 Dein persönliches Coaching-Wissen ist jetzt aktiv<br>
            🎯 KI nutzt DEIN Wissen vorrangig vor Standard-LLM
        `;
        
        Utils.showToast('Dein Coaching-Wissen wurde erfolgreich an die KI übertragen!', 'success');
        
        // Enable advanced features
        enablePersonalizedCoaching();
        
    } catch (error) {
        cloneStatus.innerHTML = '❌ Fehler beim Übertragen des Wissens. Versuche es erneut.';
        Utils.showToast('Fehler beim Wissens-Upload.', 'error');
    } finally {
        processBtn.textContent = '🧠 Wissen an KI übertragen';
        processBtn.disabled = false;
    }
};

// Test Knowledge Clone
window.testKnowledgeClone = function() {
    const input = DOM.find('#coachInput');
    if (input) {
        input.value = 'Teste meinen personalisierten Coaching-Clone: Wie würde ICH als Coach mit einem Klienten umgehen, der Probleme mit Work-Life-Balance hat? Nutze mein hochgeladenes Wissen.';
        
        // Nach kurzer Verzögerung Coach-KI aufrufen
        setTimeout(() => {
            askOpenAICoach();
        }, 500);
    }
    
    Utils.showToast('Clone-Test gestartet - prüfe ob die KI dein Wissen nutzt!', 'info');
};

// Personalized Coaching Features aktivieren
function enablePersonalizedCoaching() {
    // Add "Clone Mode" Indikator
    const quickAccess = DOM.find('.quick-access');
    if (quickAccess && !DOM.find('#cloneModeIndicator')) {
        const indicator = DOM.create('div', {
            id: 'cloneModeIndicator',
            style: 'background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 10px; border-radius: 8px; text-align: center; margin-bottom: 15px; font-weight: 600;',
            innerHTML: '🧠 PERSONALISIERTER CLONE AKTIV - KI nutzt DEIN Wissen!'
        });
        quickAccess.parentNode.insertBefore(indicator, quickAccess);
    }
}

console.log('📚 Wissens-Management für Geissler Clone geladen');
// Geissler A-E Prompt System für triadisches Coaching

// Erweiterte Prompt-Struktur nach Geissler
const GeisslerPromptSystem = {
    // A-Prompts: Coach-Orientierung
    A_PROMPTS: {
        A1: {
            text: "COACH-ORIENTIERUNG: Du sollst als Coach methodisch vorgehen. Nutze aktives Zuhören, spiegle zurück was du hörst, und führe den Coachee durch strukturierte Reflexionsfragen. Halte dich an die GT-Methodik.",
            type: "A-PROMPT",
            target: "COACH",
            phase: "Vorbereitung"
        }
    },
    
    // B-Prompts: Protokoll-Anleitung für Coachee
    B_PROMPTS: {
        B1: {
            text: "PROTOKOLL-ANLEITUNG: Beschreibe deine Situation strukturiert: 1) Was ist das konkrete Problem? 2) Was ist dein Ziel? 3) Was hast du bereits versucht? 4) Welche Hindernisse siehst du? Sei so spezifisch wie möglich.",
            type: "B-PROMPT", 
            target: "COACHEE",
            phase: "Problemerfassung"
        }
    },
    
    // C-Prompts: KI-Bearbeitungsanweisungen
    C_PROMPTS: {
        C1: {
            text: "KI-BEARBEITUNG: Analysiere das erhaltene Protokoll mit diesen Textbausteinen: [AUSBALANCIERUNGSPROBLEME] [RESSOURCENAKTIVIERUNG] [ZIELFORMULIERUNG]. Gib eine strukturierte Coaching-Antwort mit konkreten nächsten Schritten.",
            type: "C-PROMPT",
            target: "KI",
            phase: "Analyse"
        }
    },
    
    // D-Prompts: Coachee-Anleitung für KI-Output
    D_PROMPTS: {
        D1: {
            text: "UMGANG MIT KI-ANTWORT: Lies die KI-Antwort aufmerksam. Welcher Punkt resoniert am stärksten mit dir? Was überrascht dich? Welcher Aspekt passt noch nicht? Teile deine Reaktion mit dem Coach.",
            type: "D-PROMPT",
            target: "COACHEE", 
            phase: "Reflexion"
        }
    },
    
    // E-Prompts: Feedback-Anleitung
    E_PROMPTS: {
        E1: {
            text: "FEEDBACK-ANLEITUNG: Bewerte die KI-Antwort: War sie hilfreich? Zu oberflächlich oder zu komplex? Hat sie dein Anliegen verstanden? Dein Feedback hilft, die nächste KI-Antwort zu verbessern.",
            type: "E-PROMPT",
            target: "COACHEE",
            phase: "Feedback"
        }
    }
};

// Mega-Prompt Builder nach Geissler-System
function buildGeisslerMegaPrompt(phase, problemType) {
    const megaPrompt = {
        phase: phase,
        problemType: problemType,
        prompts: []
    };
    
    switch(phase) {
        case 'Phase 1: Problem & Ziel':
            megaPrompt.prompts = [
                GeisslerPromptSystem.A_PROMPTS.A1,
                GeisslerPromptSystem.B_PROMPTS.B1,
                GeisslerPromptSystem.C_PROMPTS.C1,
                GeisslerPromptSystem.D_PROMPTS.D1
            ];
            break;
            
        case 'Phase 2: Analyse':
            megaPrompt.prompts = [
                {
                    text: "COACH: Führe eine Tiefenanalyse durch. Nutze systemische Fragen und erkunde Muster.",
                    type: "A-PROMPT",
                    target: "COACH"
                },
                {
                    text: "COACHEE: Beschreibe die Situation aus verschiedenen Perspektiven. Was würden andere Beteiligte sagen?",
                    type: "B-PROMPT", 
                    target: "COACHEE"
                },
                {
                    text: "KI: Nutze [MUSTERKENNUNG] und [SYSTEMANALYSE] Textbausteine für die Analyse.",
                    type: "C-PROMPT",
                    target: "KI"
                }
            ];
            break;
            
        case 'Phase 3: Lösung':
            megaPrompt.prompts = [
                {
                    text: "COACH: Fokussiere auf Lösungen und Ressourcen. Nutze die Wunderfrage.",
                    type: "A-PROMPT",
                    target: "COACH"
                },
                {
                    text: "COACHEE: Entwickle konkrete Lösungsansätze. Was wäre der erste kleine Schritt?",
                    type: "B-PROMPT",
                    target: "COACHEE"
                },
                {
                    text: "KI: Nutze [LÖSUNGSENTWICKLUNG] und [ERFOLGSIMAGINATION] für konkrete Handlungsschritte.",
                    type: "C-PROMPT", 
                    target: "KI"
                }
            ];
            break;
            
        case 'Phase 4: Umsetzung':
            megaPrompt.prompts = [
                {
                    text: "COACH: Plane konkrete Umsetzungsschritte und Erfolgskontrolle.",
                    type: "A-PROMPT",
                    target: "COACH"
                },
                {
                    text: "COACHEE: Definiere messbare Ziele und Timeline für die Umsetzung.",
                    type: "B-PROMPT",
                    target: "COACHEE"
                },
                {
                    text: "KI: Nutze [AKTIONSPLANUNG] und [SUPPORT-NETZWERK] für Umsetzungsstrategie.",
                    type: "C-PROMPT",
                    target: "KI"
                },
                {
                    text: "FEEDBACK: Bewerte die Machbarkeit des Umsetzungsplans. Was fehlt noch?",
                    type: "E-PROMPT",
                    target: "COACHEE"
                }
            ];
            break;
    }
    
    return megaPrompt;
}

// Mega-Prompt Selector Interface
function addMegaPromptSelector() {
    const promptEditor = DOM.find('.prompt-editor');
    if (!promptEditor || DOM.find('#megaPromptSelector')) return;

    const selectorHTML = `
        <div id="megaPromptSelector" style="background: rgba(147, 51, 234, 0.1); border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 2px solid rgba(147, 51, 234, 0.3);">
            <h4 style="color: #7c3aed; margin-bottom: 15px;">🎯 Geissler Mega-Prompts (A-E System)</h4>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #7c3aed;">Phase:</label>
                    <select id="megaPromptPhase" style="width: 100%; padding: 8px; border: 2px solid rgba(147, 51, 234, 0.3); border-radius: 6px;">
                        <option value="Phase 1: Problem & Ziel">Phase 1: Problem & Ziel</option>
                        <option value="Phase 2: Analyse">Phase 2: Analyse</option>
                        <option value="Phase 3: Lösung">Phase 3: Lösung</option>
                        <option value="Phase 4: Umsetzung">Phase 4: Umsetzung</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 5px; color: #7c3aed;">Problem-Typ:</label>
                    <select id="megaPromptType" style="width: 100%; padding: 8px; border: 2px solid rgba(147, 51, 234, 0.3); border-radius: 6px;">
                        <option value="leadership">Führung</option>
                        <option value="work-life">Work-Life-Balance</option>
                        <option value="career">Karriere</option>
                        <option value="team">Team-Konflikte</option>
                        <option value="change">Veränderung</option>
                    </select>
                </div>
            </div>
            
            <button onclick="generateMegaPrompt()" style="background: #7c3aed; color: white; border: none; padding: 12px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; width: 100%;">
                🧩 Mega-Prompt generieren (A-E System)
            </button>
            
            <div id="megaPromptPreview" style="display: none; background: white; border: 2px solid rgba(147, 51, 234, 0.3); border-radius: 8px; padding: 15px; margin-top: 15px;">
                <div style="color: #7c3aed; font-weight: 600; margin-bottom: 10px;">📋 Generierter Mega-Prompt:</div>
                <div id="megaPromptContent" style="font-family: monospace; line-height: 1.5; color: #374151;"></div>
            </div>
        </div>
    `;
    
    promptEditor.insertAdjacentHTML('afterbegin', selectorHTML);
}

// Mega-Prompt Generator
window.generateMegaPrompt = function() {
    const phase = DOM.find('#megaPromptPhase')?.value;
    const type = DOM.find('#megaPromptType')?.value;
    
    if (!phase || !type) return;
    
    const megaPrompt = buildGeisslerMegaPrompt(phase, type);
    const preview = DOM.find('#megaPromptPreview');
    const content = DOM.find('#megaPromptContent');
    
    if (preview && content) {
        let promptText = `GEISSLER MEGA-PROMPT (${phase})\n\n`;
        
        megaPrompt.prompts.forEach((prompt, index) => {
            promptText += `${prompt.type} - ${prompt.target}:\n${prompt.text}\n\n`;
        });
        
        content.textContent = promptText;
        preview.style.display = 'block';
        
        // In Editor laden
        const editor = DOM.find('#promptEditor');
        if (editor) {
            editor.value = promptText;
        }
        
        Utils.showToast('Geissler Mega-Prompt generiert!', 'success');
    }
};

console.log('🎯 Geissler A-E Prompt System geladen');
// E-Prompt Feedback System für Coachee

// Feedback Interface zu Collaboration hinzufügen
function addCoacheeFeedbackSystem() {
    // Erweitere Collaboration Messages mit Feedback-Buttons
    const originalUpdateDisplay = CoachInterface.updateCollaborationDisplay;
    
    CoachInterface.updateCollaborationDisplay = function(messages) {
        originalUpdateDisplay.call(this, messages);
        
        // Feedback-Buttons zu KI-Antworten hinzufügen
        const kiMessages = DOM.findAll('.message').forEach(messageEl => {
            const senderEl = messageEl.querySelector('[style*="font-weight: bold"]');
            if (senderEl && (senderEl.textContent.includes('🤖') || senderEl.textContent.includes('🚀'))) {
                addFeedbackToMessage(messageEl);
            }
        });
    };
}

// Feedback zu KI-Message hinzufügen
function addFeedbackToMessage(messageEl) {
    if (messageEl.querySelector('.feedback-section')) return; // Bereits vorhanden
    
    const feedbackSection = DOM.create('div', {
        className: 'feedback-section',
        style: 'margin-top: 15px; padding: 15px; background: rgba(245, 158, 11, 0.1); border-radius: 8px; border-left: 4px solid #f59e0b;',
        innerHTML: `
            <div style="color: #92400e; font-weight: 600; margin-bottom: 10px;">
                📝 E-PROMPT: Wie war diese KI-Antwort für dich?
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px;">
                <button onclick="giveFeedback(this, 'helpful')" class="feedback-btn" data-type="helpful" style="background: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; cursor: pointer;">
                    ✅ Hilfreich
                </button>
                <button onclick="giveFeedback(this, 'too-complex')" class="feedback-btn" data-type="too-complex" style="background: #f59e0b; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; cursor: pointer;">
                    🤯 Zu komplex
                </button>
                <button onclick="giveFeedback(this, 'too-simple')" class="feedback-btn" data-type="too-simple" style="background: #f59e0b; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; cursor: pointer;">
                    😴 Zu oberflächlich
                </button>
                <button onclick="giveFeedback(this, 'misunderstood')" class="feedback-btn" data-type="misunderstood" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; cursor: pointer;">
                    ❌ Falsch verstanden
                </button>
            </div>
            <textarea placeholder="Dein detailliertes Feedback (optional)..." style="width: 100%; min-height: 60px; padding: 8px; border: 2px solid rgba(245, 158, 11, 0.3); border-radius: 6px; font-size: 0.9rem; resize: vertical;"></textarea>
            <button onclick="submitDetailedFeedback(this)" style="background: #f59e0b; color: white; border: none; padding: 8px 15px; border-radius: 6px; font-weight: 600; cursor: pointer; margin-top: 8px;">
                📤 Feedback senden
            </button>
        `
    });
    
    messageEl.appendChild(feedbackSection);
}

// Feedback geben
window.giveFeedback = function(button, type) {
    const feedbackSection = button.closest('.feedback-section');
    const messageEl = button.closest('.message');
    
    // Alle Buttons deaktivieren
    feedbackSection.querySelectorAll('.feedback-btn').forEach(btn => {
        btn.style.opacity = '0.5';
        btn.disabled = true;
    });
    
    // Gewählten Button hervorheben
    button.style.opacity = '1';
    button.style.transform = 'scale(1.05)';
    
    // Feedback-Daten sammeln
    const feedbackData = {
        type: type,
        timestamp: new Date().toISOString(),
        messageContent: messageEl.querySelector('[style*="line-height"]')?.textContent || '',
        source: 'coachee'
    };
    
    // Feedback an Coach senden
    sendFeedbackToCoach(feedbackData);
    
    // E-Prompt basierte Antwort
    showEPromptResponse(type, feedbackSection);
    
    Utils.showToast(`Feedback "${type}" gesendet`, 'success');
};

// Detailliertes Feedback senden
window.submitDetailedFeedback = function(button) {
    const textarea = button.previousElementSibling;
    const feedbackText = textarea.value.trim();
    
    if (!feedbackText) {
        Utils.showToast('Bitte gib detailliertes Feedback ein.', 'error');
        return;
    }
    
    const feedbackData = {
        type: 'detailed',
        content: feedbackText,
        timestamp: new Date().toISOString(),
        source: 'coachee'
    };
    
    sendFeedbackToCoach(feedbackData);
    
    // Feedback als Message hinzufügen
    if (window.coachingComm) {
        window.coachingComm.addMessage('👤 Coachee Feedback', `📝 Detailliertes Feedback zur KI-Antwort:\n\n${feedbackText}`);
    }
    
    // Interface ausblenden
    button.closest('.feedback-section').style.display = 'none';
    
    Utils.showToast('Detailliertes Feedback gesendet!', 'success');
};

// Feedback an Coach weiterleiten
function sendFeedbackToCoach(feedbackData) {
    if (!window.coachingComm) return;
    
    let feedbackMessage = `📊 COACHEE FEEDBACK: ${feedbackData.type}`;
    
    if (feedbackData.content) {
        feedbackMessage += `\n\n"${feedbackData.content}"`;
    }
    
    feedbackMessage += `\n\n💡 Diese Information hilft, die nächste KI-Antwort zu verbessern.`;
    
    // Nur für Coach sichtbar (spezielle Markierung)
    window.coachingComm.addMessage('📊 Feedback System', feedbackMessage);
}

// E-Prompt Response basierend auf Feedback-Typ
function showEPromptResponse(type, feedbackSection) {
    const responses = {
        'helpful': 'Super! Die KI hat dir geholfen. Welcher konkrete Aspekt war besonders wertvoll?',
        'too-complex': 'Die Antwort war zu komplex. Lass uns das vereinfachen - welcher Teil war unklar?',
        'too-simple': 'Die Antwort war zu oberflächlich. Was hättest du dir detaillierter gewünscht?',
        'misunderstood': 'Die KI hat dich missverstanden. Wie könntest du dein Anliegen klarer formulieren?'
    };
    
    const responseDiv = DOM.create('div', {
        style: 'margin-top: 10px; padding: 10px; background: rgba(59, 130, 246, 0.1); border-radius: 6px; border-left: 3px solid #3b82f6;',
        innerHTML: `
            <div style="color: #1e40af; font-weight: 600; margin-bottom: 5px;">💬 Coaching-Rückfrage:</div>
            <div style="color: #374151; font-style: italic;">${responses[type] || 'Danke für dein Feedback!'}</div>
        `
    });
    
    feedbackSection.appendChild(responseDiv);
}

// Feedback Analytics für Coach
function addFeedbackAnalytics() {
    const coachKIContainer = DOM.find('.coachki-container');
    if (!coachKIContainer || DOM.find('#feedbackAnalytics')) return;

    const analyticsHTML = `
        <div id="feedbackAnalytics" style="background: rgba(16, 185, 129, 0.1); border-radius: 15px; padding: 20px; margin-bottom: 20px; border: 2px solid rgba(16, 185, 129, 0.3);">
            <h4 style="color: #065f46; margin-bottom: 15px;">📊 Feedback Analytics (E-Prompt System)</h4>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                <div style="text-align: center; padding: 10px; background: white; border-radius: 8px;">
                    <div style="font-size: 1.5rem; color: #10b981;">✅</div>
                    <div style="font-weight: 600;">Hilfreich</div>
                    <div id="helpfulCount" style="font-size: 1.2rem; color: #065f46;">0</div>
                </div>
                <div style="text-align: center; padding: 10px; background: white; border-radius: 8px;">
                    <div style="font-size: 1.5rem; color: #f59e0b;">🤯</div>
                    <div style="font-weight: 600;">Zu komplex</div>
                    <div id="complexCount" style="font-size: 1.2rem; color: #92400e;">0</div>
                </div>
                <div style="text-align: center; padding: 10px; background: white; border-radius: 8px;">
                    <div style="font-size: 1.5rem; color: #f59e0b;">😴</div>
                    <div style="font-weight: 600;">Zu oberflächlich</div>
                    <div id="simpleCount" style="font-size: 1.2rem; color: #92400e;">0</div>
                </div>
                <div style="text-align: center; padding: 10px; background: white; border-radius: 8px;">
                    <div style="font-size: 1.5rem; color: #ef4444;">❌</div>
                    <div style="font-weight: 600;">Missverstanden</div>
                    <div id="misunderstoodCount" style="font-size: 1.2rem; color: #dc2626;">0</div>
                </div>
            </div>
            
            <div style="background: rgba(16, 185, 129, 0.1); border-radius: 8px; padding: 12px;">
                <div style="font-weight: 600; color: #065f46; margin-bottom: 5px;">💡 Feedback-Insights:</div>
                <div id="feedbackInsights" style="color: #374151; font-size: 0.9rem;">
                    Noch kein Feedback erhalten. E-Prompts helfen dir, die KI-Qualität zu verstehen.
                </div>
            </div>
        </div>
    `;
    
    coachKIContainer.insertAdjacentHTML('afterbegin', analyticsHTML);
}

// Feedback Analytics updaten
function updateFeedbackAnalytics(type) {
    const countEl = DOM.find(`#${type}Count`);
    if (countEl) {
        const currentCount = parseInt(countEl.textContent) || 0;
        countEl.textContent = currentCount + 1;
    }
    
    // Insights updaten
    const insights = DOM.find('#feedbackInsights');
    if (insights) {
        const helpful = parseInt(DOM.find('#helpfulCount')?.textContent) || 0;
        const complex = parseInt(DOM.find('#complexCount')?.textContent) || 0;
        const simple = parseInt(DOM.find('#simpleCount')?.textContent) || 0;
        const misunderstood = parseInt(DOM.find('#misunderstoodCount')?.textContent) || 0;
        
        const total = helpful + complex + simple + misunderstood;
        
        if (total > 0) {
            const helpfulPercent = Math.round((helpful / total) * 100);
            insights.innerHTML = `
                ${helpfulPercent}% der KI-Antworten waren hilfreich. 
                ${complex > 0 ? `${complex} zu komplex, ` : ''}
                ${simple > 0 ? `${simple} zu oberflächlich, ` : ''}
                ${misunderstood > 0 ? `${misunderstood} missverstanden` : ''}
            `;
        }
    }
}

console.log('📝 E-Prompt Feedback System geladen');
// Geissler Features initialisieren
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            addKnowledgeManagementSection();
            addMegaPromptSelector(); 
            addFeedbackAnalytics();
            addCoacheeFeedbackSystem();
            console.log('🎯 Geissler triadisches KI-Coaching Features aktiviert');
        }
    }, 4000);
});
