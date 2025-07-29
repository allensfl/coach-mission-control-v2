const methodDescriptions = {
  loesungsorientiert: "Fokus auf Ressourcen, Zukunftsvisionen & konkrete nächste Schritte.",
  systemisch: "Kontextbezogene Fragen, Mehrperspektivität & systemische Dynamik.",
  triadisch: "KI-gestützter Dreiklang zwischen Coach, Coachee & KI – inspiriert von Harald Geissler."
};

document.getElementById('methodSelect').addEventListener('change', function () {
  const selected = this.value;
  const descBox = document.getElementById('methodDescription');
  descBox.innerHTML = methodDescriptions[selected] || "";
});
