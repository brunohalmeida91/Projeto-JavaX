// Simulador Dinâmico de Economia
function updateCalculator() {
  const km = parseFloat(document.getElementById("kmInput").value);
  const gasPrice = parseFloat(document.getElementById("gasPriceInput").value);

// Atualização dos Rótulos  
  document.getElementById("kmValue").innerText =
    km.toLocaleString("pt-BR") + " km";
  document.getElementById("gasPriceValue").innerText =
    "R$ " + gasPrice.toFixed(2).replace(".", ",");

// Cálculo: Gasolina = 10 km/L | Elétrico = R$ 0.12/km  
  const gasCostMonthly = (km / 10) * gasPrice;
  const evCostMonthly = km * 0.12;
  const monthlySavings = gasCostMonthly - evCostMonthly;
  const annualSavings = monthlySavings * 12;

  document.getElementById("annualSavings").innerText =
    "R$ " + Math.round(annualSavings).toLocaleString("pt-BR");
}

// Pré-seleciona o modelo ao clicar no card da frota
function selectCarModel(modelName) {
  const select = document.getElementById("carModelSelect");
  if (select) {
    select.value = modelName;
  }
}

// Manipulação do Formulário
const STORAGE_KEY = "javax_agendamentos";

// ---------- Armazenamento ----------
function getBookings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveBookings(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// ---------- Utilitários ----------
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function getModelLabel(value) {
  const opt = document.querySelector(`#carModelSelect option[value="${value}"]`);
  return opt ? opt.textContent : value;
}

function formatDate(isoDate) {
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

function showAlert(message, type = "success") {
  const alertBox = document.getElementById("alertBox");
  const icon = type === "success" ? "fa-check-circle" : "fa-exclamation-circle";
  alertBox.innerHTML = `<i class="fas ${icon} text-info me-2"></i> ${message}`;
  alertBox.classList.remove("d-none");
  setTimeout(() => alertBox.classList.add("d-none"), 5000);
}

// Preenche as opções de horário (09:00 às 17:00)
function fillTimeOptions() {
  const select = document.getElementById("timeInput");
  for (let h = 9; h <= 17; h++) {
    const time = String(h).padStart(2, "0") + ":00";
    select.innerHTML += `<option value="${time}">${time}</option>`;
  }
}

// ---------- CREATE / UPDATE ----------
function handleFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById("bookingId").value;
  const booking = {
    id: id || Date.now().toString(),
    name: document.getElementById("nameInput").value.trim(),
    email: document.getElementById("emailInput").value.trim(),
    model: document.getElementById("carModelSelect").value,
    date: document.getElementById("dateInput").value,
    time: document.getElementById("timeInput").value,
  };

  const bookings = getBookings();

  // Evita dois agendamentos do mesmo carro na mesma data e horário
  const conflict = bookings.some(
    (b) =>
      b.id !== booking.id &&
      b.model === booking.model &&
      b.date === booking.date &&
      b.time === booking.time
  );
  if (conflict) {
    showAlert("Esse modelo já está reservado nesse dia e horário. Escolha outro horário.", "error");
    return;
  }

  if (id) {
    // UPDATE
    const index = bookings.findIndex((b) => b.id === id);
    bookings[index] = booking;
    showAlert("Agendamento atualizado com sucesso!");
  } else {
    // CREATE
    bookings.push(booking);
    showAlert("Agendamento realizado com sucesso! Nossa equipe entrará em contato para confirmar sua experiência.");
  }

  saveBookings(bookings);
  resetForm();
  renderBookings();
}

// ---------- READ (tabela abaixo do formulário) ----------
function renderBookings() {
  const tbody = document.getElementById("bookingsList");
  const counter = document.getElementById("bookingsCount");

  // Ordena pela data e horário, o mais próximo primeiro
  const bookings = getBookings().sort((a, b) =>
    (a.date + a.time).localeCompare(b.date + b.time)
  );

  // Atualiza o contador (singular/plural)
  counter.textContent =
    bookings.length + (bookings.length === 1 ? " agendamento" : " agendamentos");

  // Lista vazia: mostra uma linha com aviso ocupando todas as colunas
  if (bookings.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-secondary small py-4">
          <i class="far fa-calendar-times me-1"></i> Nenhum agendamento ainda.
        </td>
      </tr>`;
    return;
  }

  // Monta uma linha (tr) para cada agendamento salvo
  tbody.innerHTML = bookings
    .map(
      (b) => `
      <tr>
        <td>${escapeHtml(b.name)}</td>
        <td class="text-secondary">${escapeHtml(b.email)}</td>
        <td class="text-info text-nowrap">${escapeHtml(getModelLabel(b.model))}</td>
        <td class="text-nowrap">${formatDate(b.date)}</td>
        <td class="text-nowrap">${b.time}</td>
        <td class="text-end text-nowrap">
          <button class="btn btn-sm btn-neon-cyan" title="Editar" onclick="editBooking('${b.id}')">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-sm btn-neon-purple ms-1" title="Excluir" onclick="deleteBooking('${b.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>`
    )
    .join("");
}

// ---------- UPDATE (carregar no formulário) ----------
function editBooking(id) {
  const b = getBookings().find((item) => item.id === id);
  if (!b) return;

  document.getElementById("bookingId").value = b.id;
  document.getElementById("nameInput").value = b.name;
  document.getElementById("emailInput").value = b.email;
  document.getElementById("carModelSelect").value = b.model;
  document.getElementById("dateInput").value = b.date;
  document.getElementById("timeInput").value = b.time;

  document.getElementById("submitBtn").textContent = "Salvar Alterações";
  document.getElementById("cancelEditBtn").classList.remove("d-none");
  document.getElementById("testDriveForm").scrollIntoView({ behavior: "smooth" });
}

// ---------- DELETE ----------
function deleteBooking(id) {
  if (!confirm("Deseja realmente excluir este agendamento?")) return;

  // Se o agendamento excluído estava sendo editado, limpa o formulário
  if (document.getElementById("bookingId").value === id) {
    resetForm();
  }

  // Mantém na lista todos, menos o que foi excluído
  saveBookings(getBookings().filter((b) => b.id !== id));
  renderBookings();
  showAlert("Agendamento excluído.");
}

// ---------- Reset do formulário ----------
function resetForm() {
  document.getElementById("testDriveForm").reset();
  document.getElementById("bookingId").value = "";
  document.getElementById("submitBtn").textContent = "Confirmar Agendamento";
  document.getElementById("cancelEditBtn").classList.add("d-none");
}

// ---------- Inicialização ----------
window.onload = function () {
  updateCalculator();
  fillTimeOptions();
  // Não permite datas passadas
  document.getElementById("dateInput").min = new Date().toISOString().split("T")[0];
  renderBookings();
};