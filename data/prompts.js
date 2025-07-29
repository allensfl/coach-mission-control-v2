/* ===== PROMPTS.JS - Prompt-Datenbank ===== */

window.prompts = {
    // ===== GEISSLER TRIADISCH (GT1-GT12) =====
    GT1: {
        text: "Ich habe folgendes Anliegen: [PROBLEMBESCHREIBUNG]. Kannst du mir helfen, das strukturiert zu durchdenken?",
        category: "GT", 
        phase: 1,
        description: "ERSTANLIEGEN - Offene Eingangsfrage zur Problemdefinition"
    },
    GT2: {
        text: "Hier noch zusätzliche Informationen zu meinem Anliegen: [ERGÄNZUNGEN]. Bitte fasse meine Situation strukturiert zusammen und gliedere in: - Ist-Situation (was ist jetzt) - Soll-Situation (was soll werden) - Erste Hypothesen zu möglichen Ursachen",
        category: "GT", 
        phase: 1,
        description: "ZUSATZINFORMATIONEN - Strukturierte Situationsanalyse"
    },
    GT3: {
        text: "Ich habe folgendes Bild gewählt: [BILDBESCHREIBUNG]. Was sagt dieses Bild über mein Coaching-Ziel aus? Welche unbewussten Aspekte meines Anliegens könnte es widerspiegeln?",
        category: "GT", 
        phase: 1,
        description: "SYMBOLBILD-ANALYSE - Unbewusste Aspekte durch Metaphern"
    },
    GT4: {
        text: "Bitte analysiere mein Anliegen und identifiziere mit Hilfe des Textbausteins 'ausbalancierungsprobleme' das Ausbalancierungsproblem, das am besten zu meiner Situation passt. Erkläre, warum diese Spannungspole für mich relevant sind.",
        category: "GT", 
        phase: 1,
        description: "AUSBALANCIERUNGSPROBLEME - Spannungsfeld-Identifikation"
    },
    GT5: {
        text: "Nutze strukturelle Aufstellung: Stelle dir vor, dein Problem ist eine Person, die dir gegenübersteht. Wie sieht sie aus? Wie verhält sie sich? Was will sie dir sagen? Führe einen Dialog mit ihr.",
        category: "GT", 
        phase: 2,
        description: "STRUKTURELLE AUFSTELLUNG - Dialog mit dem Problem"
    },
    GT6: {
        text: "Betrachte dein Anliegen aus der Metaperspektive: Wenn du als neutraler Beobachter auf deine Situation schaust - was fällt dir auf? Welche Muster erkennst du?",
        category: "GT", 
        phase: 2,
        description: "METAPERSPEKTIVE - Neutrale Beobachterposition"
    },
    GT7: {
        text: "Aktiviere deine Ressourcen: In welcher Situation hast du schon einmal eine ähnliche Herausforderung gemeistert? Was hat dir damals geholfen? Welche Stärken hast du dabei gezeigt?",
        category: "GT", 
        phase: 2,
        description: "RESSOURCENAKTIVIERUNG - Erfolgreiche Lösungsstrategien"
    },
    GT8: {
        text: "Entwickle eine Vision: Stelle dir vor, du hast dein Problem gelöst. Wie sieht dein Leben dann aus? Was machst du anders? Wie fühlst du dich? Beschreibe es so konkret wie möglich.",
        category: "GT", 
        phase: 3,
        description: "ZUKUNFTSVISION - Konkretes Zielbild entwickeln"
    },
    GT9: {
        text: "Identifiziere Hindernisse: Was könnte dich daran hindern, dein Ziel zu erreichen? Welche inneren und äußeren Widerstände siehst du? Wie könntest du damit umgehen?",
        category: "GT", 
        phase: 3,
        description: "HINDERNISANALYSE - Potentielle Stolpersteine erkennen"
    },
    GT10: {
        text: "Plane erste Schritte: Was ist der kleinste, konkreteste Schritt, den du in den nächsten 48 Stunden unternehmen könntest? Was brauchst du dafür?",
        category: "GT", 
        phase: 4,
        description: "ERSTE SCHRITTE - Konkrete Handlungsplanung"
    },
    GT11: {
        text: "Schaffe Verbindlichkeit: Wer könnte dich bei deinem Vorhaben unterstützen? Wem würdest du von deinem Plan erzählen? Wie stellst du sicher, dass du dranbleibst?",
        category: "GT", 
        phase: 4,
        description: "VERBINDLICHKEIT - Unterstützung und Kontrolle"
    },
    GT12: {
        text: "Reflektiere den Prozess: Was nimmst du aus unserem Gespräch mit? Was war besonders hilfreich? Was möchtest du vertiefen? Wie geht es weiter?",
        category: "GT", 
        phase: 4,
        description: "PROZESSREFLEXION - Learnings und Ausblick"
    },

    // ===== SOLUTION FINDER STANDARD =====
    SF1: {
        text: "Du bist mein Coaching Solution Finder. Spiegle mir mein Anliegen wider und hilf mir, es klarer zu verstehen. Was hörst du zwischen den Zeilen?",
        category: "SF", 
        phase: 1,
        description: "COACHING SOLUTION FINDER - Klarheit durch Spiegelung"
    },
    ZIEL: {
        text: "Hilf mir, mein Anliegen als konkretes, positives Ziel zu formulieren. Was genau möchte ich erreichen? Wie werde ich merken, dass ich es geschafft habe?",
        category: "SF", 
        phase: 1,
        description: "ZIELFORMULIERUNG - Konkrete positive Zielentwicklung"
    },
    RESSOURCEN: {
        text: "Welche Ressourcen, Stärken und Fähigkeiten habe ich bereits, die mir bei meinem Anliegen helfen können? Was hat in ähnlichen Situationen schon funktioniert?",
        category: "SF", 
        phase: 2,
        description: "RESSOURCENCHECK - Vorhandene Stärken aktivieren"
    },
    AUSNAHMEN: {
        text: "Wann ist das Problem nicht da oder weniger stark? Gibt es Momente, wo es schon so ist, wie ich es mir wünsche? Was ist dann anders?",
        category: "SF", 
        phase: 2,
        description: "AUSNAHMEZEITEN - Positive Abweichungen finden"
    },
    SKALIERUNG: {
        text: "Auf einer Skala von 1-10: Wo stehe ich heute mit meinem Anliegen? Was wäre ein realistisches nächstes Level? Was bräuchte es für einen Punkt mehr?",
        category: "SF", 
        phase: 2,
        description: "SKALIERUNGSFRAGEN - Fortschritt messbar machen"
    },
    WUNDERFRAGE: {
        text: "Stell dir vor, über Nacht passiert ein Wunder und dein Problem ist gelöst, aber du merkst es nicht sofort. Woran würdest du am nächsten Morgen erkennen, dass das Wunder geschehen ist?",
        category: "SF", 
        phase: 3,
        description: "WUNDERFRAGE - Lösungsvision entwickeln"
    },

    // ===== DIAGNOSTISCHE PROMPTS =====
    DIAG1: {
        text: "Analysiere mein Anliegen: Welches der 19 Grundspannungsfelder passt am besten? Erkläre, warum diese Polarität für mich relevant ist und wie sie sich zeigt.",
        category: "DIAG", 
        phase: 1,
        description: "SPANNUNGSFELD-IDENTIFIKATION - Grundpolaritäten erkennen"
    },
    DIAG2: {
        text: "Erkenne Muster: Wo zeigt sich dieses Thema noch in meinem Leben? Welche wiederkehrenden Situationen oder Konflikte gibt es? Was ist das zugrundeliegende Muster?",
        category: "DIAG", 
        phase: 1,
        description: "MUSTERKENNUNG - Wiederkehrende Dynamiken"
    },
    DIAG3: {
        text: "Systemische Sicht: Wer ist alles von meinem Anliegen betroffen? Welche Rollen spielen andere Personen? Wie beeinflusst mein Verhalten das System?",
        category: "DIAG", 
        phase: 1,
        description: "SYSTEMANALYSE - Beziehungsdynamiken verstehen"
    },
    DIAG4: {
        text: "Emotionale Ebene: Welche Gefühle sind mit meinem Anliegen verbunden? Was ist die stärkste Emotion? Was will mir dieses Gefühl sagen?",
        category: "DIAG", 
        phase: 1,
        description: "EMOTIONSANALYSE - Gefühlswelt verstehen"
    },
    DIAG5: {
        text: "Glaubenssätze: Welche Überzeugungen über mich, andere oder die Welt spielen bei meinem Anliegen eine Rolle? Welche Gedanken gehen mir immer wieder durch den Kopf?",
        category: "DIAG", 
        phase: 1,
        description: "GLAUBENSSÄTZE - Mentale Muster identifizieren"
    },

    // ===== LÖSUNGSORIENTIERTE PROMPTS =====
    LÖS1: {
        text: "Entwickle eine lebendige Erfolgsimagination für mein Ziel. Nutze alle Sinne: Was sehe, höre, fühle, rieche ich, wenn ich erfolgreich bin? Mache es so konkret und motivierend wie möglich.",
        category: "LÖS", 
        phase: 3,
        description: "ERFOLGSIMAGINATION ENTWICKELN - Multisensorische Zielvision"
    },
    LÖS2: {
        text: "Finde kreative Lösungsoptionen: Brainstorme mindestens 5 verschiedene Wege, wie du dein Ziel erreichen könntest. Denke auch an unkonventionelle Ansätze.",
        category: "LÖS", 
        phase: 3,
        description: "LÖSUNGSBRAINSTORMING - Kreative Optionen entwickeln"
    },
    LÖS3: {
        text: "Nutze die 'Als-ob'-Technik: Handle 24 Stunden lang so, als ob dein Problem bereits gelöst wäre. Was würdest du anders machen? Wie würdest du dich verhalten?",
        category: "LÖS", 
        phase: 3,
        description: "ALS-OB-TECHNIK - Lösungsverhalten einüben"
    },
    LÖS4: {
        text: "Definiere konkrete Handlungsschritte: Was sind die 3 wichtigsten Aktionen, die du in den nächsten 2 Wochen umsetzen wirst? Mache sie spezifisch und messbar.",
        category: "LÖS", 
        phase: 4,
        description: "AKTIONSPLANUNG - Konkrete Umsetzungsschritte"
    },
    LÖS5: {
        text: "Baue ein Unterstützungsnetz: Wer kann dir bei der Umsetzung helfen? Wen würdest du als Sparringspartner, Mentor oder Motivator gewinnen?",
        category: "LÖS", 
        phase: 4,
        description: "SUPPORT-NETZWERK - Hilfe organisieren"
    },

    // ===== META-PROMPTS FÜR COACHES =====
    META1: {
        text: "Analysiere den bisherigen Coaching-Verlauf: Wo stehen wir im Prozess? Was funktioniert gut? Was sollten wir anpassen?",
        category: "META", 
        phase: 0,
        description: "PROZESS-CHECK - Coaching-Verlauf evaluieren"
    },
    META2: {
        text: "Prüfe die Beziehungsebene: Wie ist der Rapport zum Coachee? Ist die Vertrauensbasis da? Wo könnte die Beziehung gestärkt werden?",
        category: "META", 
        phase: 0,
        description: "RAPPORT-CHECK - Beziehungsqualität bewerten"
    },
    META3: {
        text: "Bewerte die Zielerreichung: Macht der Coachee Fortschritte? Sind die Ziele noch relevant? Braucht es eine Anpassung?",
        category: "META", 
        phase: 0,
        description: "FORTSCHRITTS-CHECK - Zielerreichung bewerten"
    },

    // ===== AVATAR-AUFSTELLUNGEN =====
    AVA1: {
        text: "Stelle dir vor, alle beteiligten Personen oder inneren Anteile deines Problems stehen im Raum. Beschreibe ihre Positionen zueinander: Wer steht wo? Wer schaut wen an? Welche Atmosphäre herrscht?",
        category: "AVA", 
        phase: 2,
        description: "AVATAR-AUFSTELLUNG - Systemische Positionierung"
    },
    AVA2: {
        text: "Gib jedem Avatar eine Stimme: Was sagt dein 'Problem-Anteil'? Was sagt dein 'Lösungs-Anteil'? Lass sie miteinander sprechen.",
        category: "AVA", 
        phase: 2,
        description: "AVATAR-DIALOG - Innere Anteile sprechen lassen"
    },
    AVA3: {
        text: "Verändere die Aufstellung: Wo würdest du die Avatare hinbewegen, damit es sich stimmiger anfühlt? Was verändert sich dadurch in der Dynamik?",
        category: "AVA", 
        phase: 3,
        description: "AVATAR-TRANSFORMATION - Neue Ordnung finden"
    },

    // ===== NOTFALL & GRENZEN =====
    WARN1: {
        text: "ACHTUNG: Erkenne ich Anzeichen von Depression, Suizidalität oder Selbstverletzung, beende ich das Coaching und empfehle professionelle therapeutische Hilfe.",
        category: "WARN", 
        phase: 0,
        description: "NOTFALL-ERKENNUNG - Warnsignale identifizieren"
    },
    WARN2: {
        text: "GRENZE: Bei Themen wie Trauma, Sucht oder schweren psychischen Erkrankungen verweise ich an entsprechende Fachkräfte. Coaching ersetzt keine Therapie.",
        category: "WARN", 
        phase: 0,
        description: "COACHING-GRENZEN - Abgrenzung zur Therapie"
    },
    QK1: {
        text: "Qualitätskontrolle: Ist mein Coachee überfordert? Braucht es eine Pause? Sind wir im richtigen Tempo?",
        category: "QK", 
        phase: 0,
        description: "QUALITÄTSKONTROLLE - Coachee-Zustand checken"
    },

    // ===== GRUPPEN & PAARE =====
    PAAR1: {
        text: "Paar-Coaching: Beide Partner sollen abwechselnd ihre Sicht schildern, ohne dass der andere unterbricht. Was ist die gemeinsame Vision?",
        category: "PAAR", 
        phase: 1,
        description: "PAAR-DIALOG - Strukturierte Kommunikation"
    },
    GRUPPE1: {
        text: "Team-Coaching: Jedes Teammitglied teilt mit: Was läuft gut im Team? Was könnte besser laufen? Was ist mein Beitrag dazu?",
        category: "GRUPPE", 
        phase: 1,
        description: "TEAM-CHECK - Standortbestimmung im Team"
    },

    // ===== LIVE & DIGITAL =====
    LIVE1: {
        text: "Live-Coaching Support: Ich brauche sofort eine Intervention für eine schwierige Coaching-Situation. Was ist der beste nächste Schritt?",
        category: "LIVE", 
        phase: 0,
        description: "LIVE-SUPPORT - Sofortige Prozesshilfe"
    },
    MOBIL1: {
        text: "Mobile Coaching: Kurze, prägnante Intervention für unterwegs. Fokus auf das Wesentliche in max. 5 Minuten.",
        category: "MOBIL", 
        phase: 0,
        description: "MOBILE INTERVENTION - Coaching to go"
    },

    // ===== EMOTIONALE INTELLIGENCE =====
    EI1: {
        text: "Emotionale Intelligenz: Welche Emotionen nimmst du bei dir wahr, wenn du an dein Anliegen denkst? Wie beeinflussen diese Gefühle deine Entscheidungen?",
        category: "EI", 
        phase: 2,
        description: "EMOTIONSWAHRNEHMUNG - Gefühle erkennen und verstehen"
    },
    EI2: {
        text: "Empathie entwickeln: Versetz dich in die Lage der anderen beteiligten Personen. Wie könnten sie die Situation erleben? Was sind ihre Bedürfnisse?",
        category: "EI", 
        phase: 2,
        description: "PERSPEKTIVENWECHSEL - Andere Sichtweisen verstehen"
    },

    // ===== WERTEARBEIT =====
    WERTE1: {
        text: "Werteklarheit: Welche deiner wichtigsten Werte sind bei diesem Anliegen berührt? Wo fühlst du dich in deinen Werten unterstützt oder verletzt?",
        category: "WERTE", 
        phase: 1,
        description: "WERTEIDENTIFIKATION - Grundlegende Werte erkennen"
    },
    WERTE2: {
        text: "Wertekonflikt: Gibt es Werte, die sich bei deinem Anliegen widersprechen? Wie könntest du einen guten Kompromiss zwischen ihnen finden?",
        category: "WERTE", 
        phase: 2,
        description: "WERTEAUSGLEICH - Innere Konflikte lösen"
    },

    // ===== STÄRKENORIENTIERUNG =====
    STÄRKE1: {
        text: "Charakterstärken: Welche deiner besonderen Fähigkeiten und Talente könntest du für die Lösung deines Anliegens einsetzen? Was macht dich einzigartig?",
        category: "STÄRKE", 
        phase: 2,
        description: "STÄRKENANALYSE - Einzigartige Potentiale erkennen"
    },
    STÄRKE2: {
        text: "Erfolgsgeschichten: Erzähl von einer Situation, in der du richtig stolz auf dich warst. Was hast du da gemacht? Wie könntest du diese Erfolgsstrategie übertragen?",
        category: "STÄRKE", 
        phase: 2,
        description: "ERFOLGSMUSTER - Bewährte Strategien reaktivieren"
    }
};

console.log('📋 Prompts geladen:', Object.keys(window.prompts).length, 'Prompts verfügbar');