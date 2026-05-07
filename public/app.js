const API = '/api';

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

      <br>

      <button class="delete-btn" onclick="deleteTeam(${team.id})">
        Delete
      </button>
    `;

    container.appendChild(div);
  });


async function createTeam() {
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
}

async function deleteTeam(id) {
  await fetch(`${API}/teams/${id}`, {
    method: 'DELETE'
  });

  loadTeams();
}

loadTeams();