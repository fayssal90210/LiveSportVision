// sportsEventManager.js
// Gestion des événements sportifs via l'API

document.addEventListener('DOMContentLoaded', () => {
  const eventList = document.getElementById('event-list');
  const sportFilter = document.getElementById('sport-filter');
  const dateFilter = document.getElementById('date-filter');
  const tournamentFilter = document.getElementById('tournament-filter');
  const eventSearch = document.getElementById('event-search');
  const loadingIndicator = document.getElementById('sports-loading');
  const errorMessage = document.getElementById('sports-error');
  let eventsData = [];

  // Fonction pour charger les événements depuis l'API
  async function loadEvents() {
    try {
      loadingIndicator.style.display = 'block';
      errorMessage.style.display = 'none';

      const response = await fetch('https://topembed.pw/api.php?format=json');
      if (!response.ok) {
        throw new Error('Erreur réseau lors de la récupération des événements.');
      }
      const data = await response.json();

      // Transformer les données de l'API en une liste plate pour faciliter le filtrage
      eventsData = [];
      for (const date in data.events) {
        data.events[date].forEach(event => {
          eventsData.push({
            date: date,
            unix_timestamp: event.unix_timestamp,
            sport: event.sport,
            tournament: event.tournament,
            match: event.match,
            channels: event.channels
          });
        });
      }

      // Sauvegarder les données dans un fichier local pour le mécanisme de secours
      await fetch('files/save_events.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventsData)
      });

      // Remplir les filtres
      const sports = [...new Set(eventsData.map(event => event.sport))].sort();
      sports.forEach(sport => {
        const option = document.createElement('option');
        option.value = sport;
        option.textContent = sport;
        sportFilter.appendChild(option);
      });

      const dates = [...new Set(eventsData.map(event => event.date))].sort();
      dates.forEach(date => {
        const option = document.createElement('option');
        option.value = date;
        option.textContent = date;
        dateFilter.appendChild(option);
      });

      const tournaments = [...new Set(eventsData.map(event => event.tournament))].sort();
      tournaments.forEach(tournament => {
        const option = document.createElement('option');
        option.value = tournament;
        option.textContent = tournament;
        tournamentFilter.appendChild(option);
      });

      // Afficher tous les événements au départ
      displayEvents(eventsData);
    } catch (error) {
      console.error('Erreur lors du chargement des événements :', error);
      // Essayer de charger depuis le fichier de secours
      try {
        const fallbackResponse = await fetch('files/events.json');
        eventsData = await fallbackResponse.json();
        const sports = [...new Set(eventsData.map(event => event.sport))].sort();
        sports.forEach(sport => {
          const option = document.createElement('option');
          option.value = sport;
          option.textContent = sport;
          sportFilter.appendChild(option);
        });
        const dates = [...new Set(eventsData.map(event => event.date))].sort();
        dates.forEach(date => {
          const option = document.createElement('option');
          option.value = date;
          option.textContent = date;
          dateFilter.appendChild(option);
        });
        const tournaments = [...new Set(eventsData.map(event => event.tournament))].sort();
        tournaments.forEach(tournament => {
          const option = document.createElement('option');
          option.value = tournament;
          option.textContent = tournament;
          tournamentFilter.appendChild(option);
        });
        displayEvents(eventsData);
        errorMessage.textContent = 'Impossible de charger les données de l\'API. Utilisation des données locales.';
        errorMessage.style.display = 'block';
      } catch (fallbackError) {
        console.error('Erreur lors du chargement des données de secours :', fallbackError);
        eventList.innerHTML = '<tr><td colspan="6">Erreur lors du chargement des événements.</td></tr>';
        errorMessage.textContent = 'Erreur critique : impossible de charger les événements.';
        errorMessage.style.display = 'block';
      }
    } finally {
      loadingIndicator.style.display = 'none';
    }
  }

  // Fonction pour afficher les événements dans le tableau
  function displayEvents(events) {
    eventList.innerHTML = '';
    events.forEach(event => {
      const date = new Date(event.unix_timestamp * 1000);
      const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${event.date}</td>
        <td>${time}</td>
        <td>${event.sport}</td>
        <td>${event.tournament}</td>
        <td>${event.match}</td>
        <td>
          ${event.channels.map(channel => `
            <button class="play-button" onclick="loadStream('${channel}')">Play</button>
          `).join(' ')}
        </td>
      `;
      eventList.appendChild(row);
    });
  }

  // Fonction pour filtrer les événements
  function filterEvents() {
    const selectedSport = sportFilter.value;
    const selectedDate = dateFilter.value;
    const selectedTournament = tournamentFilter.value;
    const searchQuery = eventSearch.value.toLowerCase();

    const filteredEvents = eventsData.filter(event => {
      const matchesSport = selectedSport ? event.sport === selectedSport : true;
      const matchesDate = selectedDate ? event.date === selectedDate : true;
      const matchesTournament = selectedTournament ? event.tournament === selectedTournament : true;
      const matchesSearch = event.match.toLowerCase().includes(searchQuery);
      return matchesSport && matchesDate && matchesTournament && matchesSearch;
    });

    displayEvents(filteredEvents);
  }

  // Gestionnaires d'événements pour les filtres
  sportFilter.addEventListener('change', filterEvents);
  dateFilter.addEventListener('change', filterEvents);
  tournamentFilter.addEventListener('change', filterEvents);
  eventSearch.addEventListener('input', filterEvents);

  // Charger les événements au démarrage
  loadEvents();
});

// Fonction pour charger un stream
function loadStream(url) {
  const liveStreamIframe = document.getElementById('live-stream');
  liveStreamIframe.src = url;
  navigateTo('page-stream');
}