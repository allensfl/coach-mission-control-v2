/* ===== COMMUNICATION.JS - Kommunikation zwischen Coach und Coachee ===== */

class CoachingCommunication {
    // Fenster-Typ besser erkennen
    constructor() {
        this.storageKey = 'coaching_messages';
        this.statusKey = 'coaching_status';
        this.sessionKey = 'coaching_session';
        this.listeners = [];
        
        // Bessere Erkennung
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        
        this.isCoach = filename === 'index.html' || filename === '' || path === '/';
        this.isCollaboration = filename === 'collaboration.html';
        
        console.log('🔧 Communication initialized:', {
            path,
            filename,
            isCoach: this.isCoach,
            isCollaboration: this.isCollaboration
        });
        
        this.initializeSession();
        this.setupStorageListener();
    }

    // Session initialisieren
    initializeSession() {
        if (this.isCoach) {
            // Coach initialisiert neue Session
            const session = {
                id: this.generateSessionId(),
                startTime: new Date().toISOString(),
                coach: 'Coach',
                coachee: 'Coachee',
                status: 'waiting'
            };
            this.setSession(session);
            this.setStatus('Coach bereit - Warte auf Coachee');
        } else if (this.isCollaboration) {
            // Coachee verbindet sich
            const session = this.getSession();
            if (session) {
                session.status = 'connected';
                this.setSession(session);
                this.setStatus('Verbunden');
            }
        }
    }

    // Eindeutige Session-ID generieren
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Session-Daten
    getSession() {
        try {
            const data = localStorage.getItem(this.sessionKey);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Fehler beim Laden der Session:', e);
            return null;
        }
    }

    setSession(session) {
        try {
            localStorage.setItem(this.sessionKey, JSON.stringify(session));
        } catch (e) {
            console.error('Fehler beim Speichern der Session:', e);
        }
    }

    // Nachrichten
    getMessages() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Fehler beim Laden der Nachrichten:', e);
            return [];
        }
    }

    // Storage Events mit Force-Trigger
    setMessages(messages) {
        try {
            const messageString = JSON.stringify(messages);
            localStorage.setItem(this.storageKey, messageString);
            
            // Force trigger für same-window communication
            setTimeout(() => {
                this.notifyListeners(messages);
            }, 10);
            
            // Custom event für cross-window
            window.dispatchEvent(new StorageEvent('storage', {
                key: this.storageKey,
                newValue: messageString,
                storageArea: localStorage
            }));
            
            console.log('💾 Messages saved and broadcasted:', messages.length);
        } catch (e) {
            console.error('Fehler beim Speichern der Nachrichten:', e);
        }
    }

    // Neue Nachricht hinzufügen
    addMessage(sender, content, type = 'text') {
        const messages = this.getMessages();
        const message = {
            id: this.generateMessageId(),
            sender: sender,
            content: content,
            type: type,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        messages.push(message);
        this.setMessages(messages);
        
        console.log(`💬 Neue Nachricht von ${sender}:`, content);
        return message;
    }

    generateMessageId() {
        return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }

    // Status
    getStatus() {
        return localStorage.getItem(this.statusKey) || 'Getrennt';
    }

    setStatus(status) {
        localStorage.setItem(this.statusKey, status);
        this.notifyStatusChange(status);
    }

    // Polling und Storage Listener verbessert
    setupStorageListener() {
        console.log('🔧 Setting up storage listener for:', this.isCoach ? 'Coach' : 'Collaboration');
        
        // Cross-window communication via storage events
        window.addEventListener('storage', (e) => {
            console.log('📨 Storage event received:', e.key, e.newValue ? 'has data' : 'no data');
            
            if (e.key === this.storageKey) {
                const messages = e.newValue ? JSON.parse(e.newValue) : [];
                this.notifyListeners(messages);
                console.log('📨 Storage event processed:', messages.length, 'messages');
            } else if (e.key === this.statusKey) {
                this.notifyStatusChange(e.newValue);
            }
        });

        // Aggressive polling für collaboration window (alle 500ms)
        if (this.isCollaboration) {
            this.lastMessageCount = 0;
            
            const pollInterval = setInterval(() => {
                const currentMessages = this.getMessages();
                if (currentMessages.length !== this.lastMessageCount) {
                    console.log('🔄 Polling detected change:', this.lastMessageCount, '->', currentMessages.length);
                    this.lastMessageCount = currentMessages.length;
                    this.notifyListeners(currentMessages);
                }
            }, 500);
            
            // Initial load
            setTimeout(() => {
                const initialMessages = this.getMessages();
                console.log('🏁 Initial message load:', initialMessages.length);
                this.notifyListeners(initialMessages);
            }, 100);
        }

        // Coach side - auch polling für bessere sync
        if (this.isCoach) {
            this.lastMessageCount = this.getMessages().length;
            setInterval(() => {
                const currentMessages = this.getMessages();
                if (currentMessages.length !== this.lastMessageCount) {
                    this.lastMessageCount = currentMessages.length;
                    this.notifyListeners(currentMessages);
                }
            }, 1000);
        }
    }

    // Listener für Nachrichten-Updates
    onMessagesUpdate(callback) {
        this.listeners.push(callback);
        // Sofort mit aktuellen Nachrichten aufrufen
        callback(this.getMessages());
    }

    notifyListeners(messages) {
        this.listeners.forEach(callback => {
            try {
                callback(messages);
            } catch (e) {
                console.error('Fehler beim Benachrichtigen des Listeners:', e);
            }
        });
    }

    // Status-Change Callbacks
    onStatusChange(callback) {
        this.statusChangeListeners = this.statusChangeListeners || [];
        this.statusChangeListeners.push(callback);
        // Sofort mit aktuellem Status aufrufen
        callback(this.getStatus());
    }

    notifyStatusChange(status) {
        if (this.statusChangeListeners) {
            this.statusChangeListeners.forEach(callback => {
                try {
                    callback(status);
                } catch (e) {
                    console.error('Fehler beim Benachrichtigen des Status-Listeners:', e);
                }
            });
        }
        
        // UI-Element updaten falls vorhanden
        const statusElement = document.getElementById('connectionStatus') || 
                            document.getElementById('sessionStatus');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    // Nachrichten löschen (für neue Session)
    clearMessages() {
        localStorage.removeItem(this.storageKey);
        this.notifyListeners([]);
        console.log('🗑️ Nachrichten gelöscht');
    }

    // Session beenden
    endSession() {
        localStorage.removeItem(this.sessionKey);
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.statusKey);
        this.setStatus('Session beendet');
        console.log('🔚 Session beendet');
    }

    // Hilfsfunktionen für UI
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    // Typing-Indicator
    setTyping(isTyping, sender) {
        const typingKey = 'coaching_typing';
        const typingData = {
            isTyping: isTyping,
            sender: sender,
            timestamp: new Date().toISOString()
        };
        
        if (isTyping) {
            localStorage.setItem(typingKey, JSON.stringify(typingData));
        } else {
            localStorage.removeItem(typingKey);
        }
    }

    getTyping() {
        try {
            const data = localStorage.getItem('coaching_typing');
            if (!data) return null;
            
            const typing = JSON.parse(data);
            // Typing-Status nach 5 Sekunden automatisch löschen
            const age = Date.now() - new Date(typing.timestamp).getTime();
            if (age > 5000) {
                localStorage.removeItem('coaching_typing');
                return null;
            }
            
            return typing;
        } catch (e) {
            return null;
        }
    }

    // Connection Health Check
    isConnected() {
        const session = this.getSession();
        return session && session.status === 'connected';
    }

    // Debug-Funktionen
    debug() {
        console.log('=== COACHING COMMUNICATION DEBUG ===');
        console.log('Session:', this.getSession());
        console.log('Messages:', this.getMessages());
        console.log('Status:', this.getStatus());
        console.log('Is Coach:', this.isCoach);
        console.log('Is Collaboration:', this.isCollaboration);
    }
}

// Globale Instanz erstellen
window.coachingComm = new CoachingCommunication();

// Für Debugging in der Konsole verfügbar machen
window.debugComm = () => window.coachingComm.debug();