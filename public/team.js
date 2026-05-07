const API = '/api';

const params = new URLSearchParams(window.location.search);

const teamId = params.get('id');
const teamName = params.get('name');

document.getElementById('teamTitle').innerText = teamName;

const POSITION_ORDER = {
  GK: 1,
  CB: 2,
  LB: 3,
  RB: 4,
  RWB: 5,
  LWB: 6,
  CDM: 7,
  CM: 8,
  CAM: 9,
  RM: 10,
  LM: 11,
  RW: 12,
  LW: 13,
  CF: 14,
  ST: 15,
};

function sortPlayers(players) {
  return players.sort((a, b) => {
    const posA = POSITION_ORDER[a.positions[0]] || 999;
    const posB = POSITION_ORDER[b.positions[0]] || 999;

    if (posA !== posB) {
      return posA - posB;
    }

    return a.name.localeCompare(b.name);
  });
}

async function loadPlayers() {
  try {
    const res = await fetch(`${API}/teams/${teamId}/players`);

    let players = await res.json();

    players = sortPlayers(players);

    for (let i = 1; i <= 5; i++) {
      document.getElementById(`zone-${i}`).innerHTML = '';
    }

    players.forEach(player => {
      const card = document.createElement('div');

      card.className = 'player-card';

      card.dataset.id = player.id;

      card.innerHTML = `
        <h3>${player.name}</h3>

        <div class="player-meta">
          ${player.positions.join(', ')}
        </div>

        <div class="player-meta">
          ${player.club || ''}
          ${player.age ? `• ${player.age}` : ''}
        </div>

        <button class="delete-btn" onclick="deletePlayer(${player.id})">
          Delete
        </button>
      `;

      document
        .getElementById(`zone-${player.zone}`)
        .appendChild(card);
    });

    initDragDrop();

  } catch (err) {
    console.log('Error loading players:', err);
  }
}

async function addPlayer() {
  try {
    const name = document.getElementById('playerName').value;

    const positions = document
      .getElementById('playerPositions')
      .value
      .split(',')
      .map(p => p.trim().toUpperCase());

    const age = document.getElementById('playerAge').value;

    const club = document.getElementById('playerClub').value;

    const zone = 0;

    if (!name || positions.length === 0) {
      return;
    }

    await fetch(`${API}/teams/${teamId}/players`, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        name,
        positions,
        age,
        club,
        zone
      })
    });

    document.getElementById('playerName').value = '';
    document.getElementById('playerPositions').value = '';
    document.getElementById('playerAge').value = '';
    document.getElementById('playerClub').value = '';

    loadPlayers();

  } catch (err) {
    console.log('Error adding player:', err);
  }
}

async function deletePlayer(id) {
  try {
    await fetch(`${API}/players/${id}`, {
      method: 'DELETE'
    });

    loadPlayers();

  } catch (err) {
    console.log('Error deleting player:', err);
  }
}

function initDragDrop() {
  for (let i = 1; i <= 5; i++) {

    new Sortable(document.getElementById(`zone-${i}`), {
      group: 'shared',

      animation: 150,

      async onEnd(evt) {
        const playerId = evt.item.dataset.id;

        const newZone = evt.to.id.split('-')[1];

        await fetch(`${API}/players/${playerId}/zone`, {
          method: 'PUT',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            zone: newZone
          })
        });

        loadPlayers();
      }
    });
  }
}

loadPlayers();