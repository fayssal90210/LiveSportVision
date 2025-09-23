// streamManager.js
// Gestion du chargement des streams

document.addEventListener("DOMContentLoaded", () => {
  const streamUrlInput = document.getElementById("stream-url");
  const liveStreamIframe = document.getElementById("live-stream");
  const loadStreamButton = document.getElementById("load-stream");

  // Fonction pour vérifier si une URL est valide
  function isValidUrl(url) {
    // Vérifie si l'URL commence par http:// ou https://
    const urlPattern = /^(https?:\/\/)/i;
    return urlPattern.test(url);
  }

  // Fonction pour charger le stream dans l'iframe
  function loadStream(url) {
    try {
      liveStreamIframe.src = url;
      console.log(`Stream chargé avec succès : ${url}`);
    } catch (error) {
      console.error("Erreur lors du chargement du stream :", error);
      alert(
        "Erreur lors du chargement du stream. Veuillez vérifier l’URL et réessayer."
      );
    }
  }

  // Gestionnaire d'événement pour le bouton "PLAY"
  loadStreamButton.addEventListener("click", () => {
    const url = streamUrlInput.value.trim();

    // Vérifier si l'URL est vide
    if (!url) {
      alert("Veuillez entrer une URL de stream valide.");
      return;
    }

    // Vérifier si l'URL est valide (commence par http:// ou https://)
    if (!isValidUrl(url)) {
      alert("L’URL doit commencer par http:// ou https://.");
      return;
    }

    // Charger le stream dans l'iframe
    loadStream(url);
  });

  // Gestionnaire pour la touche "Enter" dans le champ de saisie
  streamUrlInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      loadStreamButton.click();
    }
  });
});
