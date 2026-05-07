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

      div.innerHTML = `
        <h2>${team.name}</h2>

        <a href="team.html?id=${team.id}&name=${encodeURIComponent(team.name)}">
          Open Squad
        </a>

        <br><br>

        <button class="delete-btn" onclick="deleteTeam(${team.id})">
          Delete
        </button>
      `;

      container.appendChild(div);
    });

  } catch (err) {
    console.log('Error loading teams:', err);
  }
}

async function createTeam() {
  try {
    const input = document.getElementById('teamName');

    if (!input.value.trim()) return;

    await fetch(`${API}/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: input.value
      })
    });

    input.value = '';

    loadTeams();

  } catch (err) {
    console.log('Error creating team:', err);
  }
}

async function deleteTeam(id) {
  try {
    await fetch(`${API}/teams/${id}`, {
      method: 'DELETE'
    });

    loadTeams();

  } catch (err) {
    console.log('Error deleting team:', err);
  }
}

loadTeams();