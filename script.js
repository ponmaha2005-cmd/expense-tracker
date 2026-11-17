// ---------- 1. Get elements from the page ----------
const form = document.getElementById("expense-form");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const errorText = document.getElementById("error");
const saveBtn = document.getElementById("save-btn");
const cancelBtn = document.getElementById("cancel-btn");
const formTitle = document.getElementById("form-title");
const filterSelect = document.getElementById("filter");
const list = document.getElementById("list");
const emptyText = document.getElementById("empty");
const totalText = document.getElementById("total");

// ---------- 2. Load saved data (localStorage) ----------
let expenses = [];
try {
  expenses = JSON.parse(localStorage.getItem("expenses")) || [];
} catch (e) {
  expenses = [];
}
let editingId = null; // id of the expense being edited, or null

function saveToStorage() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

// ---------- 3. Show expenses on screen ----------
function render() {
  const filter = filterSelect.value;
  const visible = expenses.filter(
    (e) => filter === "All" || e.category === filter
  );

  list.innerHTML = "";
  visible.forEach((e) => {
    const li = document.createElement("li");

    const info = document.createElement("div");
    const title = document.createElement("div");
    title.className = "item-title";
    title.textContent = e.title; // textContent keeps it safe from HTML injection
    const meta = document.createElement("div");
    meta.className = "item-meta";
    meta.textContent = e.category + " • " + e.date;

    const actions = document.createElement("div");
    actions.className = "item-actions";
    const editBtn = document.createElement("button");
    editBtn.className = "edit";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => startEdit(e.id));
    const delBtn = document.createElement("button");
    delBtn.className = "delete";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", () => deleteExpense(e.id));
    actions.append(editBtn, delBtn);

    info.append(title, meta, actions);

    const amount = document.createElement("div");
    amount.className = "item-amount";
    amount.textContent = "₹" + e.amount.toFixed(2);

    li.append(info, amount);
    list.appendChild(li);
  });

  emptyText.hidden = visible.length > 0;

  // Total of the expenses currently shown
  const total = visible.reduce((sum, e) => sum + e.amount, 0);
  totalText.textContent = "₹" + total.toFixed(2);
}

// ---------- 4. Add or update ----------
form.addEventListener("submit", (event) => {
  event.preventDefault(); // stop page reload

  const title = titleInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const date = dateInput.value;

  // Validation
  if (title === "") return showError("Please enter a title.");
  if (isNaN(amount) || amount <= 0)
    return showError("Amount must be greater than 0.");
  if (date === "") return showError("Please choose a date.");
  showError("");

  if (editingId === null) {
    expenses.unshift({
      id: Date.now(),
      title,
      amount,
      category: categoryInput.value,
      date,
    });
  } else {
    const item = expenses.find((e) => e.id === editingId);
    item.title = title;
    item.amount = amount;
    item.category = categoryInput.value;
    item.date = date;
  }

  saveToStorage();
  resetForm();
  render();
});

function showError(message) {
  errorText.textContent = message;
}

// ---------- 5. Edit and delete ----------
function startEdit(id) {
  const item = expenses.find((e) => e.id === id);
  editingId = id;
  titleInput.value = item.title;
  amountInput.value = item.amount;
  categoryInput.value = item.category;
  dateInput.value = item.date;
  formTitle.textContent = "Edit expense";
  saveBtn.textContent = "Save changes";
  cancelBtn.hidden = false;
  titleInput.focus();
}

function deleteExpense(id) {
  if (!confirm("Delete this expense?")) return;
  expenses = expenses.filter((e) => e.id !== id);
  if (editingId === id) resetForm();
  saveToStorage();
  render();
}

function resetForm() {
  form.reset();
  editingId = null;
  dateInput.value = today();
  formTitle.textContent = "Add expense";
  saveBtn.textContent = "Add expense";
  cancelBtn.hidden = true;
}

cancelBtn.addEventListener("click", () => {
  resetForm();
  showError("");
});

filterSelect.addEventListener("change", render);

// ---------- 6. Start ----------
function today() {
  return new Date().toISOString().slice(0, 10);
}
dateInput.value = today();
render();