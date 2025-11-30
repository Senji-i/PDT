const API_URL = "http://localhost:3000";
let editId = null;

// Carregar todos
async function loadAll() {
  const res = await fetch(`${API_URL}/weather`);
  const data = await res.json();

  const tbody = document.querySelector("#resultsTable tbody");
  tbody.innerHTML = "";

  data.forEach(row => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${row.id}</td>
      <td>${row.city}</td>
      <td>${row.temperature_c} °C</td>
      <td>${new Date(row.measured_at).toLocaleString()}</td>
      <td>
        <button onclick="edit(${row.id}, '${row.city}', ${row.temperature_c})">Editar</button>
        <button onclick="removeItem(${row.id})">Excluir</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

async function save() {
  const city = document.getElementById("city").value.trim();
  const temp = parseFloat(document.getElementById("temp").value);

  if (!city || isNaN(temp)) return alert("Cidade e temperatura obrigatórios!");

  if (editId) {
    await fetch(`${API_URL}/weather/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, temperature_c: temp })
    });
    editId = null;
  } else {
    await fetch(`${API_URL}/weather`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, temperature_c: temp })
    });
  }

  document.getElementById("city").value = "";
  document.getElementById("temp").value = "";

  loadAll();
}

function edit(id, city, temp) {
  editId = id;
  document.getElementById("city").value = city;
  document.getElementById("temp").value = temp;
}

async function removeItem(id) {
  if (!confirm("Deseja excluir este registro?")) return;

  await fetch(`${API_URL}/weather/${id}`, { method: "DELETE" });

  loadAll();
}

loadAll();
