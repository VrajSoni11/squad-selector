const API = '/api';

async function loadTeams() {

  try {

    const res = await fetch(`${API}/teams`);

    const teams = await res.json();

    const container = document.getElementById('teams');

    container.innerHTML = '';

    teams.forEach(team => {

      const div = document.createElement('div');

      div.className = 'team-card';

      div.style.background = team.primary_color;

      div.innerHTML = `
        <div class="team-card-top">

          <button
            class="mini-delete"
            onclick="deleteTeam(${team.id})"
          >
            ✕
          </button>

        </div>

        <h2 style="color:${team.secondary_color}">
          ${team.name}
        </h2>

        <a
          class="open-squad-btn"
          href="team.html?id=${team.id}
          &name=${encodeURIComponent(team.name)}
          &primary=${encodeURIComponent(team.primary_color)}
          &secondary=${encodeURIComponent(team.secondary_color)}"
        >
          Open Squad →
        </a>
      `;

      container.appendChild(div);

    });

  } catch (err) {

    console.log(err);

  }

}

async function createTeam() {

  try {

    const name = document
      .getElementById('teamName')
      .value
      .trim();

    const primary_color = document
      .getElementById('primaryColor')
      .value;

    const secondary_color = document
      .getElementById('secondaryColor')
      .value;

    if (!name) return;

    await fetch(`${API}/teams`, {

      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        name,
        primary_color,
        secondary_color
      })

    });

    document.getElementById('teamName').value = '';

    loadTeams();

  } catch (err) {

    console.log(err);

  }

}

async function deleteTeam(id) {

  try {

    await fetch(`${API}/teams/${id}`, {
      method: 'DELETE'
    });

    loadTeams();

  } catch (err) {

    console.log(err);

  }

}

loadTeams();