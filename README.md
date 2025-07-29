# 🎯 Coach Mission Control

Ein professionelles Coaching-Interface mit separatem Kollaborations-Fenster für Coachees. Entwickelt für Zoom-Screen-Sharing und triadisches Coaching mit KI-Unterstützung.

![Coach Mission Control](https://img.shields.io/badge/Status-Production%20Ready-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![Browser](https://img.shields.io/badge/Browser-Chrome%20%7C%20Firefox%20%7C%20Safari%20%7C%20Edge-orange)

## ✨ **Features**

- 🎯 **65+ Coaching-Prompts** - Geißler Triadisch, Solution Finder, und mehr
- 🤝 **Separates Coachee-Fenster** - Perfekt für Zoom-Screen-Sharing
- 🧠 **Coach-KI Beratung** - Intelligente Methodenempfehlungen
- 💬 **Live-Chat** - Real-time Kommunikation zwischen Coach und Coachee
- 👥 **Klienten-Management** - Professionelle Klientenverwaltung
- 📱 **Responsive Design** - Funktioniert auf allen Geräten
- 🔒 **Offline-Fähig** - Keine Server-Verbindung erforderlich

## 🚀 **Quick Start**

1. **Repository klonen:**
   ```bash
   git clone https://github.com/IHR_USERNAME/coach-mission-control.git
   cd coach-mission-control
   ```

2. **Starten:**
   - Öffnen Sie `index.html` im Browser
   - Oder verwenden Sie einen lokalen Server: `python -m http.server 8000`

3. **Erste Session:**
   - Klient auswählen → Session starten
   - Kollaborations-Fenster öffnen für Coachee
   - Prompts senden und Dialog führen

## 📁 **Projektstruktur**

```
coach-mission-control/
├── index.html                    # Haupt-Coach-Interface
├── collaboration-standalone.html # Coachee-Interface (standalone)
├── css/                          # Stylesheets
├── js/                           # JavaScript Module
└── data/                         # Prompts & Klienten-Daten
```

## 🎯 **Coaching-Workflow**

1. **👥 Klient auswählen** - Wählen Sie einen Klienten aus der Datenbank
2. **🚀 Session starten** - Initialisiert eine neue Coaching-Session
3. **📝 Prompt wählen** - 65+ professionelle Prompts in Kategorien
4. **📤 An Coachee senden** - Prompt erscheint im Kollaborations-Fenster
5. **🤖 Dialog an KI senden** - KI analysiert den Dialog und antwortet
6. **🧠 Coach-KI nutzen** - Parallel methodische Beratung erhalten

## 📋 **Prompt-Kategorien**

| Kategorie | Beschreibung | Anzahl |
|-----------|-------------|---------|
| **GT** | Geißler Triadisch (GT1-GT12) | 12 |
| **SF** | Solution Finder | 6 |
| **DIAG** | Diagnostische Tools | 5 |
| **LÖS** | Lösungsentwicklung | 5 |
| **META** | Prozess-Reflexion | 3 |
| **AVA** | Avatar-Aufstellungen | 3 |
| **WERTE** | Wertearbeit | 2 |
| **STÄRKE** | Stärkenorientierung | 2 |
| **Weitere** | Spezialformate | 25+ |

## 🛠️ **Technische Details**

### **Browser-Kompatibilität**
- Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- JavaScript ES6+ erforderlich
- localStorage muss verfügbar sein

### **Keine Server-Abhängigkeiten**
- Reine Frontend-Lösung
- localStorage für Kommunikation zwischen Fenstern
- Offline-fähig

### **Responsive Design**
- Optimiert für Desktop (1280px+)
- Funktioniert auf Tablets und Smartphones
- Separate Layouts für Coach und Coachee

## ⌨️ **Tastenkürzel**

- `Strg+Enter` - Nachricht senden
- `Escape` - Eingabefeld leeren/fokussieren

## 🔧 **Entwicklung**

### **Lokalen Server starten:**
```bash
# Python 3
python -m http.server 8000

# Node.js (falls installiert)
npx serve .

# PHP (falls installiert)
php -S localhost:8000
```

### **Neue Prompts hinzufügen:**
```javascript
// In data/prompts.js
NEUER_PROMPT: {
    text: "Ihr Prompt-Text...",
    category: "KATEGORIE",
    phase: 1,
    description: "Beschreibung"
}
```

### **Debugging:**
- Konsole öffnen (F12)
- `debugApp()` - Coach-Interface debuggen
- `debugCollaboration()` - Coachee-Interface debuggen

## 🐛 **Troubleshooting**

### **Kollaborations-Fenster bleibt leer:**
```javascript
// In Browser-Konsole des Coachee-Fensters:
debugCollaboration()
forceReloadMessages()
```

### **Popup wird blockiert:**
- Popup-Blocker in Browser deaktivieren
- Oder Ausnahme für `file://` URLs hinzufügen

### **CSS/JS lädt nicht:**
- Verwenden Sie `collaboration-standalone.html` (alle Assets inline)
- Oder starten Sie einen lokalen Server

## 📈 **Roadmap**

- [ ] WebSocket-Support für bessere Sync
- [ ] Prompt-Editor im Interface
- [ ] Export/Import von Sessions
- [ ] Audio/Video Integration
- [ ] Mobile App
- [ ] Multi-Language Support

## 🤝 **Contributing**

1. Fork das Repository
2. Feature Branch erstellen (`git checkout -b feature/amazing-feature`)
3. Änderungen committen (`git commit -m 'Add amazing fe# 🎯 Coach Mission Control

Ein professionelles Coaching-Interface mit separatem Kollaborations-Fenster für Coachees.

## 📁 Projektstruktur

```
coach-mission-control/
├── index.html              # Haupt-Coach-Interface
├── collaboration.html      # Coachee-Interface (separates Fenster)
├── css/
│   ├── common.css          # Geteilte Styles
│   ├── coach.css           # Coach-spezifische Styles
│   └── collaboration.css   # Coachee-spezifische Styles
├── js/
│   ├── common.js           # Geteilte Funktionen
│   ├── coach.js            # Coach-Interface Logik
│   ├── collaboration.js    # Coachee-Interface Logik
│   └── communication.js    # Kommunikation zwischen Fenstern
├── data/
│   ├── prompts.js          # Prompt-Datenbank (65+ Prompts)
│   └── clients.js          # Klienten-Datenbank
└── README.md               # Diese Datei
```

## 🚀 Installation & Setup

### 1. Dateien herunterladen
Laden Sie alle Dateien herunter und speichern Sie sie in einem Ordner auf Ihrem Desktop (z.B. `coach-mission-control/`).

### 2. Ordnerstruktur erstellen
Stellen Sie sicher, dass die Ordnerstruktur genau wie oben aussieht:
- Erstellen Sie die Unterordner `css/`, `js/`, und `data/`
- Platzieren Sie die Dateien in den entsprechenden Ordnern

### 3. Starten
Öffnen Sie die `index.html` direkt im Browser (Doppelklick oder Rechtsklick → "Öffnen mit" → Browser).

## 🎯 Funktionen

### Coach-Interface (index.html)
- **Klienten-Management**: Auswahl und Verwaltung von Coaching-Klienten
- **Prompt-Repository**: 65+ professionelle Coaching-Prompts in verschiedenen Kategorien
- **Coach-KI**: Intelligente Beratung für Coaching-Situationen
- **Kollaborations-Monitor**: Überwachung der Kommunikation mit dem Coachee

### Coachee-Interface (collaboration.html)
- **Separates Fenster**: Für Zoom-Screen-Sharing optimiert
- **Real-time Kommunikation**: Live-Chat mit dem Coach
- **Benutzerfreundlich**: Einfache, ablenkungsfreie Oberfläche
- **Responsive Design**: Funktioniert auf verschiedenen Bildschirmgrößen

### Kommunikation
- **localStorage-basiert**: Kommunikation zwischen den Fenstern
- **Live-Updates**: Nachrichten erscheinen sofort
- **Typing-Indicator**: Zeigt an, wenn jemand schreibt
- **Session-Management**: Automatische Session-Verwaltung

## 📋 Prompt-Kategorien

- **GT (Geißler Triadisch)**: 12 strukturierte Coaching-Prompts (GT1-GT12)
- **SF (Solution Finder)**: Lösungsorientierte Ansätze
- **DIAG**: Diagnostische Analyse-Tools
- **LÖS**: Lösungsentwicklung und Umsetzung
- **META**: Prozess-Reflexion für Coaches
- **AVA**: Avatar-Aufstellungen
- **WARN/QK**: Sicherheit und Qualitätskontrolle
- **PAAR/GRUPPE**: Spezielle Formate
- **LIVE/MOBIL**: Schnelle Interventionen
- **EI**: Emotionale Intelligenz
- **WERTE**: Wertearbeit
- **STÄRKE**: Stärkenorientierung

## 🎮 Bedienung

### Coach-Workflow
1. **Klient auswählen** → Wählen Sie einen Klienten aus der Liste
2. **Session starten** → Klicken Sie "🚀 Session starten"
3. **Prompt wählen** → Wählen Sie einen Prompt aus dem Repository
4. **Kollaborations-Fenster öffnen** → Klicken Sie "🔗 Kollaborations-Fenster öffnen"
5. **Prompt senden** → Senden Sie den Prompt an den Coachee
6. **Dialog führen** → Kommunizieren Sie über das Kollaborations-Fenster

### Coachee-Workflow
1. Das Kollaborations-Fenster wird automatisch vom Coach geöffnet
2. Warten Sie auf Prompts vom Coach
3. Antworten Sie über das Eingabefeld
4. Nutzen Sie Strg+Enter zum schnellen Senden

### Coach-KI nutzen
1. Wechseln Sie zum "🧠 Coach-KI" Tab
2. Beschreiben Sie Ihre Coaching-Situation
3. Wählen Sie Session-Phase, Coachee-Typ und Dringlichkeit
4. Klicken Sie "🧠 Coach-KI fragen"
5. Erhalten Sie professionelle Empfehlungen

## ⌨️ Tastenkürzel

- **Strg+Enter**: Nachricht senden (in beiden Fenstern)
- **Escape**: Eingabefeld leeren oder fokussieren

## 🔧 Technische Details

### Browser-Kompatibilität
- Chrome, Firefox, Safari, Edge (neueste Versionen)
- JavaScript muss aktiviert sein
- localStorage muss verfügbar sein

### Popup-Blocker
Falls das Kollaborations-Fenster nicht öffnet:
1. Popup-Blocker in den Browser-Einstellungen deaktivieren
2. Oder: Beim ersten Versuch "Immer erlauben" wählen

### Datenschutz
- Alle Daten bleiben lokal im Browser
- Keine Server-Verbindung erforderlich
- Session-Daten werden beim Schließen gelöscht

## 🐛 Troubleshooting

### Problem: Kollaborations-Fenster öffnet nicht
**Lösung**: Popup-Blocker deaktivieren oder Ausnahme hinzufügen

### Problem: Nachrichten kommen nicht an
**Lösung**: 
1. Beide Fenster aktualisieren (F5)
2. Prüfen ob localStorage aktiviert ist
3. In der Browser-Konsole (F12) nach Fehlern suchen

### Problem: Prompts werden nicht angezeigt
**Lösung**: Prüfen ob alle JavaScript-Dateien korrekt geladen wurden

### Problem: Styling fehlt
**Lösung**: Prüfen ob alle CSS-Dateien im richtigen Ordner sind

## 🔄 Updates & Erweiterungen

### Neue Prompts hinzufügen
Bearbeiten Sie `data/prompts.js` und fügen Sie neue Einträge hinzu:

```javascript
NEUER_PROMPT: {
    text: "Ihr Prompt-Text hier...",
    category: "KATEGORIE",
    phase: 1,
    description: "Kurze Beschreibung"
}
```

### Neue Klienten hinzufügen
Bearbeiten Sie `data/clients.js` und erweitern Sie das Array.

### Styling anpassen
- `css/common.css`: Grundlegende Styles
- `css/coach.css`: Coach-Interface
- `css/collaboration.css`: Coachee-Interface

## 📞 Support

Bei Problemen oder Fragen:
1. Prüfen Sie die Browser-Konsole (F12) auf Fehlermeldungen
2. Stellen Sie sicher, dass alle Dateien korrekt platziert sind
3. Testen Sie in einem anderen Browser

## 📜 Lizenz

Dieses Projekt ist für den persönlichen und professionellen Coaching-Einsatz gedacht. 
Die Prompt-Sammlung basiert auf bewährten Coaching-Methoden und kann frei verwendet werden.

---

**Viel Erfolg beim Coaching! 🎯**