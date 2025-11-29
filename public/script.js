const cityInput = document.getElementById('cityInput');
const btn = document.getElementById('getWeatherBtn');
const result = document.getElementById('weatherResult');

btn.addEventListener('click', async () => {
  const city = cityInput.value.trim();
  if (!city) {
    result.innerHTML = '<p>Digite uma cidade.</p>';
    return;
  }

  result.innerHTML = '<p>Buscando...</p>';
  try {
    const res = await fetch(`/weather?city=${encodeURIComponent(city)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      result.innerHTML = `<p>Erro: ${res.status} ${err?.error || res.statusText}</p>`;
      return;
    }
    const data = await res.json();
    if (data.cod === '404') {
      result.innerHTML = `<p>Cidade não encontrada.</p>`;
      return;
    }

    const cityName = data.city?.name || city;
    const country = data.city?.country || '';
    const list = data.list || [];
    const first = list[0];
    const temp = first?.main?.temp;
    const desc = first?.weather?.[0]?.description || '';

    let html = `<h2>${cityName} ${country}</h2>`;
    html += `<p><strong>${temp}°C</strong> - ${desc}</p>`;
    html += '<h3>Próximas leituras</h3><ul>';
    list.slice(0, 6).forEach(item => {
      const dt = new Date(item.dt * 1000).toLocaleString();
      const t = item.main?.temp;
      const d = item.weather?.[0]?.description || '';
      html += `<li>${dt}: ${t}°C - ${d}</li>`;
    });
    html += '</ul>';
    result.innerHTML = html;
  } catch (err) {
    result.innerHTML = `<p>Erro: ${err.message}</p>`;
  }
});