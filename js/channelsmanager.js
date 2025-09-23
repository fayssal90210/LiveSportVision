// channelsManager.js
// Gestion des chaînes et filtres à partir du fichier CSV

document.addEventListener('DOMContentLoaded', () => {
  const channelList = document.getElementById('channel-list');
  const countryFilter = document.getElementById('country-filter');
  const channelSearch = document.getElementById('channel-search');
  const loadingIndicator = document.getElementById('channels-loading');
  const errorMessage = document.getElementById('channels-error');
  let channelsData = [];

  // Fonction pour charger les chaînes depuis le fichier CSV
  async function loadChannels() {
    try {
      loadingIndicator.style.display = 'block';
      errorMessage.style.display = 'none';

      // Charger le fichier CSV
      const response = await fetch('files/allchannels.csv'); // Ajustez le chemin selon l'emplacement de votre fichier
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du fichier allchannels.csv.');
      }
      const csvText = await response.text();

      // Parser le CSV
      channelsData = parseCSV(csvText);

      // Sauvegarder les données dans un fichier local pour le mécanisme de secours
      await fetch('files/save_channels.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(channelsData)
      });

      // Remplir le filtre de pays
      const countries = [...new Set(channelsData.map(channel => channel.country))].sort();
      countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countryFilter.appendChild(option);
      });

      // Afficher toutes les chaînes au départ
      displayChannels(channelsData);
    } catch (error) {
      console.error('Erreur lors du chargement des chaînes :', error);
      // Essayer de charger depuis le fichier de secours
      try {
        const fallbackResponse = await fetch('files/channels.json');
        channelsData = await fallbackResponse.json();
        const countries = [...new Set(channelsData.map(channel => channel.country))].sort();
        countries.forEach(country => {
          const option = document.createElement('option');
          option.value = country;
          option.textContent = country;
          countryFilter.appendChild(option);
        });
        displayChannels(channelsData);
        errorMessage.textContent = 'Impossible de charger les données du CSV. Utilisation des données locales.';
        errorMessage.style.display = 'block';
      } catch (fallbackError) {
        console.error('Erreur lors du chargement des données de secours :', fallbackError);
        channelList.innerHTML = '<tr><td colspan="3">Erreur lors du chargement des chaînes.</td></tr>';
        errorMessage.textContent = 'Erreur critique : impossible de charger les chaînes.';
        errorMessage.style.display = 'block';
      }
    } finally {
      loadingIndicator.style.display = 'none';
    }
  }

  // Fonction pour parser le CSV avec détection automatique du séparateur
  function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) return [];

    // Détecter le séparateur en comptant les occurrences dans la première ligne
    const firstLine = lines[0];
    const commaCount = (firstLine.match(/,/g) || []).length;
    const semicolonCount = (firstLine.match(/;/g) || []).length;
    const separator = semicolonCount > commaCount ? ';' : ',';

    // Parser les en-têtes
    const headers = firstLine.split(separator).map(header => header.trim());
    const result = [];

    // Parser les lignes suivantes
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].split(separator).map(item => item.trim());
      if (line.length === headers.length) {
        const channel = {};
        headers.forEach((header, index) => {
          channel[header] = line[index];
        });
        result.push(channel);
      }
    }

    return result;
  }

  // Fonction pour afficher les chaînes dans le tableau
  function displayChannels(channels) {
    channelList.innerHTML = '';
    channels.forEach(channel => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${channel.name}</td>
        <td>
          <div class="channel-link-container">
            <input type="text" class="channel-link-input" value="${channel.url}" readonly>
            <button class="channel-link-copy">Copy</button>
          </div>
        </td>
        <td>
          <button class="play-button" onclick="loadStream('${channel.url}')">Play</button>
        </td>
      `;
      channelList.appendChild(row);
    });

    // Ajouter les gestionnaires d'événements pour les boutons "Copy"
    document.querySelectorAll('.channel-link-copy').forEach(button => {
      button.addEventListener('click', (e) => {
        const input = e.target.previousElementSibling;
        input.select();
        document.execCommand('copy');
        alert('Lien copié : ' + input.value);
      });
    });
  }

  // Fonction pour filtrer les chaînes
  function filterChannels() {
    const selectedCountry = countryFilter.value;
    const searchQuery = channelSearch.value.toLowerCase();

    const filteredChannels = channelsData.filter(channel => {
      const matchesCountry = selectedCountry ? channel.country === selectedCountry : true;
      const matchesSearch = channel.name.toLowerCase().includes(searchQuery);
      return matchesCountry && matchesSearch;
    });

    displayChannels(filteredChannels);
  }

  // Gestionnaires d'événements pour les filtres
  countryFilter.addEventListener('change', filterChannels);
  channelSearch.addEventListener('input', filterChannels);

  // Charger les chaînes au démarrage
  loadChannels();
});

// Fonction pour charger un stream
function loadStream(url) {
  const liveStreamIframe = document.getElementById('live-stream');
  liveStreamIframe.src = url;
  navigateTo('page-stream');
}