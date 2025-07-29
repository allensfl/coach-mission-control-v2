/* ===== CLIENTS.JS - Klienten-Datenbank ===== */

window.clients = [
    {
        id: 1,
        name: "Sarah Müller",
        age: 42,
        profession: "Projektmanagerin",
        topics: ["Work-Life-Balance", "Führung", "Stressmanagement"],
        background: "Erfahrene Projektmanagerin in einem Tech-Unternehmen. Leitet ein Team von 12 Entwicklern.",
        challenges: [
            "Schwierigkeiten beim Delegieren",
            "Hoher Perfektionismus",
            "Wenig Zeit für Familie"
        ],
        goals: [
            "Bessere Work-Life-Balance finden",
            "Führungsstil weiterentwickeln",
            "Stressresilienz aufbauen"
        ],
        sessionHistory: 3,
        lastSession: "2024-01-15"
    },
    {
        id: 2,
        name: "Michael Chen",
        age: 35,
        profession: "Startup-Gründer",
        topics: ["Entrepreneurship", "Risikomanagement", "Vision"],
        background: "Serienunternehmer, der sein drittes Startup aufbaut. Spezialisiert auf KI-Lösungen für Gesundheitswesen.",
        challenges: [
            "Unsicherheit bei strategischen Entscheidungen",
            "Team-Aufbau und Mitarbeitermotivation", 
            "Investoren-Kommunikation"
        ],
        goals: [
            "Klarere Unternehmensvision entwickeln",
            "Entscheidungsprozesse optimieren",
            "Führungsqualitäten stärken"
        ],
        sessionHistory: 1,
        lastSession: "2024-01-22"
    },
    {
        id: 3,
        name: "Dr. Anna Richter",
        age: 51,
        profession: "Ärztin/Klinikdirektorin",
        topics: ["Leadership", "Change Management"],
        background: "Leitende Ärztin und Direktorin einer mittelgroßen Klinik. Verantwortlich für 200+ Mitarbeiter.",
        challenges: [
            "Widerstand gegen Digitalisierungsmaßnahmen",
            "Generationenkonflikte im Team",
            "Burnout-Prävention bei sich und anderen"
        ],
        goals: [
            "Change-Prozesse erfolgreich gestalten",
            "Teamkommunikation verbessern",
            "Nachhaltige Arbeitsstrukturen etablieren"
        ],
        sessionHistory: 5,
        lastSession: "2024-01-18"
    },
    {
        id: 4,
        name: "Thomas Weber",
        age: 58,
        profession: "Senior Manager",
        topics: ["Ruhestand", "Sinnfindung", "Neuorientierung"],
        background: "Langjähriger Manager in der Automobilindustrie. Steht vor dem Übergang in den Ruhestand.",
        challenges: [
            "Angst vor dem Bedeutungsverlust",
            "Unklare Vorstellungen über die Zukunft",
            "Identität jenseits der Arbeit finden"
        ],
        goals: [
            "Sinnvolle Beschäftigung für den Ruhestand finden",
            "Neue Identität entwickeln",
            "Übergang erfolgreich gestalten"
        ],
        sessionHistory: 2,
        lastSession: "2024-01-20"
    },
    {
        id: 5,
        name: "Lisa Rodriguez",
        age: 29,
        profession: "Marketing-Spezialistin",
        topics: ["Karriereentwicklung", "Selbstvertrauen", "Networking"],
        background: "Ambitionierte Marketing-Expertin in einer Beratungsfirma. Möchte den nächsten Karriereschritt machen.",
        challenges: [
            "Impostor-Syndrom in Senior-Meetings",
            "Schwierigkeiten beim Selbstmarketing",
            "Work-Life-Integration als Alleinerziehende"
        ],
        goals: [
            "Selbstvertrauen in der Kommunikation stärken",
            "Netzwerk strategisch ausbauen",
            "Beförderung zur Senior-Position erreichen"
        ],
        sessionHistory: 0,
        lastSession: null
    },
    {
        id: 6,
        name: "Robert Kim",
        age: 44,
        profession: "IT-Architect",
        topics: ["Teamführung", "Kommunikation", "Agilität"],
        background: "Technischer Leiter eines agilen Entwicklungsteams. Wechsel von reiner Technik zur Personalführung.",
        challenges: [
            "Übergang von Fachexperte zu Führungskraft",
            "Konflikte im Team moderieren",
            "Agile Methoden erfolgreich implementieren"
        ],
        goals: [
            "Führungskompetenzen entwickeln",
            "Kommunikationsfähigkeiten verbessern",
            "Team-Performance steigern"
        ],
        sessionHistory: 4,
        lastSession: "2024-01-16"
    }
];

// Hilfsfunktionen für Klienten-Management
window.ClientUtils = {
    // Klient nach ID finden
    findById(id) {
        return window.clients.find(client => client.id === id);
    },

    // Klienten nach Thema filtern
    filterByTopic(topic) {
        return window.clients.filter(client => 
            client.topics.some(t => t.toLowerCase().includes(topic.toLowerCase()))
        );
    },

    // Klienten nach Profession filtern
    filterByProfession(profession) {
        return window.clients.filter(client => 
            client.profession.toLowerCase().includes(profession.toLowerCase())
        );
    },

    // Alle verfügbaren Topics extrahieren
    getAllTopics() {
        const topics = new Set();
        window.clients.forEach(client => {
            client.topics.forEach(topic => topics.add(topic));
        });
        return Array.from(topics).sort();
    },

    // Alle verfügbaren Professionen extrahieren
    getAllProfessions() {
        return [...new Set(window.clients.map(client => client.profession))].sort();
    },

    // Klient-Statistiken
    getStats() {
        const totalClients = window.clients.length;
        const avgAge = window.clients.reduce((sum, client) => sum + client.age, 0) / totalClients;
        const totalSessions = window.clients.reduce((sum, client) => sum + client.sessionHistory, 0);
        
        return {
            totalClients,
            avgAge: Math.round(avgAge),
            totalSessions,
            avgSessionsPerClient: Math.round(totalSessions / totalClients * 10) / 10
        };
    },

    // Aktuelle Klienten (letzte Session < 30 Tage)
    getActiveClients() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        return window.clients.filter(client => {
            if (!client.lastSession) return false;
            const lastSessionDate = new Date(client.lastSession);
            return lastSessionDate > thirtyDaysAgo;
        });
    },

    // Neue Klienten (keine Sessions)
    getNewClients() {
        return window.clients.filter(client => client.sessionHistory === 0);
    },

    // Klient-Profil HTML generieren
    generateProfileHTML(clientId) {
        const client = this.findById(clientId);
        if (!client) return '';

        return `
            <div class="client-profile">
                <div class="profile-header">
                    <h3>${client.name}</h3>
                    <span class="age-badge">${client.age} Jahre</span>
                </div>
                <div class="profile-info">
                    <p><strong>Beruf:</strong> ${client.profession}</p>
                    <p><strong>Sessions:</strong> ${client.sessionHistory}</p>
                    ${client.lastSession ? `<p><strong>Letzte Session:</strong> ${new Date(client.lastSession).toLocaleDateString('de-DE')}</p>` : '<p><em>Neuer Klient</em></p>'}
                </div>
                <div class="profile-topics">
                    <h4>Coaching-Themen:</h4>
                    <div class="topics-tags">
                        ${client.topics.map(topic => `<span class="topic-tag">${topic}</span>`).join('')}
                    </div>
                </div>
                <div class="profile-challenges">
                    <h4>Herausforderungen:</h4>
                    <ul>
                        ${client.challenges.map(challenge => `<li>${challenge}</li>`).join('')}
                    </ul>
                </div>
                <div class="profile-goals">
                    <h4>Ziele:</h4>
                    <ul>
                        ${client.goals.map(goal => `<li>${goal}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    },

    // Empfohlene Prompts für Klienten
    getRecommendedPrompts(clientId) {
        const client = this.findById(clientId);
        if (!client) return [];

        const recommendations = [];

        // Neue Klienten starten mit GT1
        if (client.sessionHistory === 0) {
            recommendations.push('GT1', 'SF1', 'ZIEL');
        }

        // Topic-basierte Empfehlungen
        if (client.topics.includes('Leadership') || client.topics.includes('Führung')) {
            recommendations.push('DIAG3', 'STÄRKE1');
        }

        if (client.topics.includes('Work-Life-Balance')) {
            recommendations.push('WERTE1', 'LÖS1');
        }

        if (client.topics.includes('Karriereentwicklung')) {
            recommendations.push('RESSOURCEN', 'LÖS2');
        }

        if (client.topics.includes('Change Management')) {
            recommendations.push('AVA1', 'DIAG2');
        }

        // Alter-basierte Empfehlungen
        if (client.age > 50) {
            recommendations.push('WERTE1', 'GT8');
        }

        if (client.age < 35) {
            recommendations.push('STÄRKE2', 'LÖS2');
        }

        // Session-History basierte Empfehlungen
        if (client.sessionHistory > 3) {
            recommendations.push('META1', 'GT12');
        }

        return [...new Set(recommendations)]; // Duplikate entfernen
    }
};

console.log('👥 Klienten geladen:', window.clients.length, 'Klienten verfügbar');
console.log('📊 Klienten-Statistiken:', window.ClientUtils.getStats());