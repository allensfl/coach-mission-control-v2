/* ===== COMMON.JS - Geteilte Funktionen für alle Seiten ===== */

// Globale Variablen
window.coachingApp = {
    selectedClient: null,
    currentPrompt: null,
    collaborationWindow: null,
    sessionStartTime: null
};

// Utility-Funktionen
const Utils = {
    // Zeitstempel formatieren
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Datum formatieren
    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    },

    // Session-Zeit berechnen
    getSessionDuration(startTime) {
        if (!startTime) return '00:00';
        
        const now = new Date();
        const start = new Date(startTime);
        const diff = Math.floor((now - start) / 1000);
        
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${(diff % 60).toString().padStart(2, '0')}`;
    },

    // Text kürzen
    truncateText(text, maxLength = 100) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    // HTML escapen
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Zufällige ID generieren
    generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    // Element Animation
    animateElement(element, animationClass = 'fade-in') {
        element.classList.add(animationClass);
        setTimeout(() => {
            element.classList.remove(animationClass);
        }, 500);
    },

    // Toast-Benachrichtigungen
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Styles
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });

        document.body.appendChild(toast);
        
        // Animation
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 10);

        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    },

    // Local Storage mit Error Handling
    setStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage Error:', e);
            return false;
        }
    },

    getStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Storage Error:', e);
            return defaultValue;
        }
    }
};

// DOM-Hilfsfunktionen
const DOM = {
    // Element sicher finden
    find(selector) {
        return document.querySelector(selector);
    },

    findAll(selector) {
        return document.querySelectorAll(selector);
    },

    // Element erstellen
    create(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else {
                element.setAttribute(key, value);
            }
        });

        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });

        return element;
    },

    // Event Listener mit Cleanup
    on(element, event, handler, options = {}) {
        element.addEventListener(event, handler, options);
        return () => element.removeEventListener(event, handler, options);
    },

    // Element leeren
    empty(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }
};

// Message-Hilfsfunktionen
const MessageHelpers = {
    // Nachricht-HTML erstellen
    createMessageHTML(message) {
        const time = Utils.formatTime(message.timestamp);
        const senderClass = message.sender.toLowerCase().replace(/[^a-z]/g, '');
        
        return `
            <div class="message-bubble ${senderClass}" data-message-id="${message.id}">
                <div class="message-header">
                    <span class="message-sender">${Utils.escapeHtml(message.sender)}</span>
                    <span class="message-time">${time}</span>
                </div>
                <div class="message-content">
                    ${this.formatMessageContent(message.content)}
                </div>
            </div>
        `;
    },

    // Nachrichteninhalt formatieren
    formatMessageContent(content) {
        // Einfache Markdown-ähnliche Formatierung
        return Utils.escapeHtml(content)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    },

    // Nachrichten-Container scrollen
    scrollToBottom(container) {
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }
};

// Session-Timer
const SessionTimer = {
    startTime: null,
    timerInterval: null,
    
    start() {
        this.startTime = new Date();
        window.coachingApp.sessionStartTime = this.startTime;
        
        this.timerInterval = setInterval(() => {
            this.updateDisplay();
        }, 1000);
        
        this.updateDisplay();
    },

    stop() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },

    updateDisplay() {
        const element = DOM.find('#sessionTime');
        if (element && this.startTime) {
            element.textContent = Utils.getSessionDuration(this.startTime);
        }
    },

    getDuration() {
        return this.startTime ? Utils.getSessionDuration(this.startTime) : '00:00';
    }
};

// Keyboard Shortcuts
const KeyboardShortcuts = {
    init() {
        document.addEventListener('keydown', (e) => {
            // Strg/Cmd + Enter = Nachricht senden
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                const sendBtn = DOM.find('#sendBtn') || DOM.find('.send-response-btn');
                if (sendBtn && !sendBtn.disabled) {
                    sendBtn.click();
                }
            }
            
            // Escape = Input leeren
            if (e.key === 'Escape') {
                const input = DOM.find('#responseInput') || DOM.find('#promptEditor');
                if (input && document.activeElement === input) {
                    input.value = '';
                }
            }
        });
    }
};

// Fenster-Management
const WindowManager = {
    collaborationWindow: null,
    
    openCollaborationWindow() {
        const url = 'collaboration-gray-standalone.html'; // Geändert!
        const features = 'width=900,height=700,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no';
        
        // Prüfen ob Fenster bereits offen
        if (this.collaborationWindow && !this.collaborationWindow.closed) {
            this.collaborationWindow.focus();
            return this.collaborationWindow;
        }
        
        // Neues Fenster öffnen
        this.collaborationWindow = window.open(url, 'collaboration', features);
        
        if (this.collaborationWindow) {
            // Status aktualisieren
            setTimeout(() => {
                if (window.coachingComm) {
                    window.coachingComm.setStatus('Kollaborations-Fenster geöffnet');
                }
            }, 1000);
            
            Utils.showToast('Kollaborations-Fenster geöffnet', 'success');
        } else {
            Utils.showToast('Popup wurde blockiert. Bitte Popup-Blocker deaktivieren.', 'error');
        }
        
        return this.collaborationWindow;
    },
    
    isCollaborationWindowOpen() {
        return this.collaborationWindow && !this.collaborationWindow.closed;
    },
    
    closeCollaborationWindow() {
        if (this.collaborationWindow && !this.collaborationWindow.closed) {
            this.collaborationWindow.close();
            this.collaborationWindow = null;
        }
    }
};

// Initialisierung wenn DOM geladen
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Common.js geladen');
    
    // Keyboard Shortcuts aktivieren
    KeyboardShortcuts.init();
    
    // Global verfügbar machen
    window.Utils = Utils;
    window.DOM = DOM;
    window.MessageHelpers = MessageHelpers;
    window.SessionTimer = SessionTimer;
    window.WindowManager = WindowManager;
    
    // Kollaborations-Fenster öffnen Funktion global verfügbar machen
    window.openCollaborationWindow = () => WindowManager.openCollaborationWindow();
});

// Error Handling
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    Utils.showToast('Ein Fehler ist aufgetreten. Siehe Konsole für Details.', 'error');
});

// Unload Event
window.addEventListener('beforeunload', function() {
    // Session-Timer stoppen
    SessionTimer.stop();
    
    // Kollaborations-Fenster schließen wenn Coach-Seite geschlossen wird
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        WindowManager.closeCollaborationWindow();
    }
});

// Debugging
window.debugApp = function() {
    console.log('=== COACHING APP DEBUG ===');
    console.log('Selected Client:', window.coachingApp.selectedClient);
    console.log('Current Prompt:', window.coachingApp.currentPrompt);
    console.log('Session Start Time:', window.coachingApp.sessionStartTime);
    console.log('Collaboration Window:', WindowManager.isCollaborationWindowOpen());
    if (window.coachingComm) {
        window.coachingComm.debug();
    }
};