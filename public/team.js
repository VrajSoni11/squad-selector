const API = '/api';

const params = new URLSearchParams(window.location.search);

const teamId = params.get('id');
const teamName = params.get('name');

document.getElementById('teamTitle').innerText = teamName;

let sortableInitialized = false;

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

    /* RESET ZONES */

    for (let i = 0; i <= 5; i++) {

      const zone = document.getElementById(`zone-${i}`);

      if (zone) {
        zone.innerHTML = '';
      }

      const countElement =
        document.getElementById(`count-${i}`);

      if (countElement) {
        countElement.innerText = '0';
      }

    }

    /* RENDER PLAYERS */

    players.forEach(player => {

      const card = document.createElement('div');

      const primaryPosition =
        player.positions[0]
          .trim()
          .toUpperCase();

      let cardType = 'attacker-card';

      /* GOALKEEPER */

      if (primaryPosition === 'GK') {

        cardType = 'gk-card';

      }

      /* DEFENDERS */

      else if (
        primaryPosition === 'CB' ||
        primaryPosition === 'LB' ||
        primaryPosition === 'RB'
      ) {

        cardType = 'defender-card';

      }

      /* MIDFIELDERS */

      else if (
        primaryPosition === 'CDM' ||
        primaryPosition === 'CM'
      ) {

        cardType = 'midfielder-card';

      }

      /* ATTACKERS */

      else if (
        primaryPosition === 'CAM' ||
        primaryPosition === 'RW' ||
        primaryPosition === 'LW' ||
        primaryPosition === 'ST'
      ) {

        cardType = 'attacker-card';

      }

      card.className =
        `player-card ${cardType}`;

      card.dataset.id = player.id;

      const positions =
        player.positions.join(' • ');

      const clubText =
        player.club
          ? player.club
          : 'No Club';

      const ageText =
        player.age
          ? `${player.age} yrs`
          : '';

      card.innerHTML = `

        <button
          class="delete-btn"
          onclick="deletePlayer(${player.id})"
        >
          ✕
        </button>

        <h3>${player.name}</h3>

        <div class="player-meta">
          ${positions}
        </div>

        <div class="player-meta">
          ${clubText}
          ${ageText ? ` • ${ageText}` : ''}
        </div>

      `;

      const zone =
        document.getElementById(`zone-${player.zone}`);

      if (zone) {

        zone.appendChild(card);

      }

      /* UPDATE COUNT */

      const countElement =
        document.getElementById(`count-${player.zone}`);

      if (countElement) {

        const currentCount =
          parseInt(countElement.innerText);

        countElement.innerText =
          currentCount + 1;

      }

    });

    /* INIT DRAG ONLY ONCE */

    if (!sortableInitialized) {

      initDragDrop();

      sortableInitialized = true;

    }

  } catch (err) {

    console.log('Error loading players:', err);

  }

}

async function addPlayer() {

  try {

    const name = document
      .getElementById('playerName')
      .value
      .trim();

    const positionsInput = document
      .getElementById('playerPositions')
      .value
      .trim();

    const age = document
      .getElementById('playerAge')
      .value;

    const club = document
      .getElementById('playerClub')
      .value
      .trim();

    if (!name || !positionsInput) {
      return;
    }

    const positions = positionsInput
      .split(',')
      .map(p => p.trim().toUpperCase())
      .filter(Boolean);

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
        zone: 0
      })

    });

    /* RESET FORM */

    document.getElementById('playerName').value = '';
    document.getElementById('playerPositions').value = '';
    document.getElementById('playerAge').value = '';
    document.getElementById('playerClub').value = '';

    await loadPlayers();

  } catch (err) {

    console.log('Error adding player:', err);

  }

}

async function deletePlayer(id) {

  try {

    await fetch(`${API}/players/${id}`, {
      method: 'DELETE'
    });

    await loadPlayers();

  } catch (err) {

    console.log('Error deleting player:', err);

  }

}

function initDragDrop() {

  const zones = document.querySelectorAll('.zone-drop');

  zones.forEach(zone => {

    new Sortable(zone, {

      group: 'shared',

      animation: 180,

      ghostClass: 'dragging',

      onEnd: async function(evt) {

        const playerId = evt.item.dataset.id;

        const newZone = parseInt(
          evt.to.id.split('-')[1]
        );

        try {

          await fetch(`${API}/players/${playerId}/zone`, {

            method: 'PUT',

            headers: {
              'Content-Type': 'application/json'
            },

            body: JSON.stringify({
              zone: newZone
            })

          });

          await loadPlayers();

        } catch (err) {

          console.log('Drag update failed:', err);

        }

      }

    });

  });

}

loadPlayers();