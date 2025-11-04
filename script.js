// Simple front-end auth & app logic
const REPORT_ID_KEY = 'currentReportId';
const EXPENSES_KEY = 'expenseClaims';
const LOGIN_STATUS_KEY = 'isLoggedIn';

function checkAuth(){
  const isLoggedIn = sessionStorage.getItem(LOGIN_STATUS_KEY);
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if (isLoggedIn === 'true' && currentPage === 'login.html') {
    window.location.href = 'index.html';
  } else if (isLoggedIn !== 'true' && currentPage === 'index.html') {
    window.location.href = 'login.html';
  }
}

function attemptLogin(username, password){
  const correctUsername = 'user';
  const correctPassword = 'pass';
  if (username === correctUsername && password === correctPassword) {
    sessionStorage.setItem(LOGIN_STATUS_KEY, 'true');
    window.location.href = 'index.html';
  } else {
    const err = document.getElementById('errorMessage');
    if (err) err.textContent = 'Invalid username or password.';
  }
}

window.logout = function(){
  sessionStorage.removeItem(LOGIN_STATUS_KEY);
  window.location.href = 'login.html';
}

function calculateTotalFromTable(){
  const tbody = document.getElementById('expenseList');
  if (!tbody) return;
  let total = 0;
  tbody.querySelectorAll('tr').forEach(row => {
    const amtCell = row.children[7];
    if (amtCell) {
      const val = parseFloat(amtCell.textContent.trim()) || 0;
      total += val;
    }
  });
  const totalEl = document.getElementById('totalAmount');
  if (totalEl) totalEl.value = total.toFixed(2);
}

function addRow(){
  const tbody = document.getElementById('expenseList');
  const tr = document.createElement('tr');
  for (let i=0;i<8;i++){
    const td = document.createElement('td');
    td.contentEditable = "true";
    td.addEventListener('input', () => calculateTotalFromTable());
    tr.appendChild(td);
  }
  tbody.appendChild(tr);
}

function deleteRow(){
  const tbody = document.getElementById('expenseList');
  if (!tbody) return;
  const rows = tbody.querySelectorAll('tr');
  if (rows.length>1){
    tbody.removeChild(rows[rows.length-1]);
    calculateTotalFromTable();
  } else {
    rows[0].querySelectorAll('td').forEach(td => td.textContent='');
    calculateTotalFromTable();
  }
}

function setupPrintButton(){
  const btn = document.getElementById('printBtn');
  if (btn){
    btn.addEventListener('click', () => { window.print(); });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  const current = window.location.pathname.split('/').pop() || 'index.html';
  if (current === 'login.html'){
    const form = document.getElementById('loginForm');
    if (form){
      form.addEventListener('submit', e => {
        e.preventDefault();
        attemptLogin(document.getElementById('username').value.trim(), document.getElementById('password').value.trim());
      });
    }
  } else if (current === 'index.html'){
    const addBtn = document.getElementById('addRow');
    if (addBtn) addBtn.addEventListener('click', addRow);
    const delBtn = document.getElementById('deleteRow');
    if (delBtn) delBtn.addEventListener('click', deleteRow);
    setupPrintButton();
    document.querySelectorAll('#expenseList td[contenteditable="true"]').forEach(td => td.addEventListener('input', calculateTotalFromTable));
    calculateTotalFromTable();
  }
});