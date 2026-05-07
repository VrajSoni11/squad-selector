const API = '/api';

const params = new URLSearchParams(window.location.search);
const teamId = params.get('id');
const teamName = params.get('name');