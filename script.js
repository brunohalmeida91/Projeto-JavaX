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
function handleFormSubmit(e) {
  e.preventDefault();
  const alertBox = document.getElementById("alertBox");
  alertBox.classList.remove("d-none");
  document.getElementById("testDriveForm").reset();

  setTimeout(() => {
    alertBox.classList.add("d-none");
  }, 5000);
}

// Inicialização
window.onload = function () {
  updateCalculator();
};
