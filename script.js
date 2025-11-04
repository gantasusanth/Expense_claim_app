// --- Global State and Constants ---
let editingIndex = null; 
const REPORT_ID_KEY = 'currentReportId';
const EXPENSES_KEY = 'expenseClaims';
const LOGIN_STATUS_KEY = 'isLoggedIn'; // NEW KEY for tracking login status
 
// ******************************************************
// --- NEW LOGIN/LOGOUT FUNCTIONS ---
// ******************************************************
 
// Checks if the user should be on the current page (security check)
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem(LOGIN_STATUS_KEY);
    // Gets the filename of the current page (e.g., 'index.html' or 'login.html')
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
 
    if (isLoggedIn === 'true' && currentPage === 'login.html') {
        // Logged in, but on the login page: Redirect to the main app
        window.location.href = 'index.html';
    } else if (isLoggedIn !== 'true' && currentPage === 'index.html') {
        // Not logged in, but on the main app: Redirect to the login page
        window.location.href = 'login.html';
    }
}
 
// Function to handle the actual login attempt
function attemptLogin(username, password) {
    // *** Placeholder Hard-Coded Credentials ***
    const correctUsername = 'user';
    const correctPassword = 'pass'; 
 
    if (username === correctUsername && password === correctPassword) {
        // Success: Set a session variable and redirect
        sessionStorage.setItem(LOGIN_STATUS_KEY, 'true');
        window.location.href = 'index.html'; 
    } else {
        // Failure: Show error message
        document.getElementById('errorMessage').textContent = 'Invalid username or password.';
    }
}
 
// Function to handle logging out (Used by the button in index.html)
window.logout = function() {
    // Clear the session status
    sessionStorage.removeItem(LOGIN_STATUS_KEY);
    // Redirect to the login page
    window.location.href = 'login.html'; 
}
 
// ******************************************************
// --- END NEW LOGIN/LOGOUT FUNCTIONS ---
// ******************************************************
 
 
// --- Core Utility Functions (Unchanged) ---
 
function generateUniqueId() {
    return 'EXP-' + Math.floor(Math.random() * 90000 + 10000);
}
 
function loadExpenses() {
    const expensesJSON = localStorage.getItem(EXPENSES_KEY);
    return expensesJSON ? JSON.parse(expensesJSON) : [];
}
 
function saveExpenses(expenses) {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
}
 
// --- ID and Report Management (Unchanged) ---
 
function manageReportId() {
    let reportId = localStorage.getItem(REPORT_ID_KEY);
    
    if (!reportId) {
        reportId = generateUniqueId();
        localStorage.setItem(REPORT_ID_KEY, reportId);
    }
    
    document.getElementById('reportIdDisplay').textContent = reportId;
}
 
window.startNewReport = function() {
    if (confirm("Are you sure you want to clear all data and start a NEW REPORT? This action cannot be undone.")) {
        localStorage.removeItem(EXPENSES_KEY);
        localStorage.removeItem(REPORT_ID_KEY);
        
        manageReportId();
        renderExpenses(); 
    }
};
 
// --- CRUD Operations (Unchanged) ---
 
function calculateTotal(expenses) {
    let total = 0;
    expenses.forEach(expense => {
        total += parseFloat(expense.amount) || 0; 
    });
    document.getElementById('totalAmount').textContent = '$' + total.toFixed(2);
}
 
window.editExpense = function(index) {
    const expenses = loadExpenses();
    const expense = expenses[index];
 
    document.getElementById('date').value = expense.date;
    document.getElementById('category').value = expense.category;
    document.getElementById('amount').value = expense.amount;
    document.getElementById('description').value = expense.description;
 
    editingIndex = index; 
 
    document.getElementById('addExpenseBtn').textContent = 'Update Expense';
};
 
window.deleteExpense = function(index) {
    if (confirm("Are you sure you want to delete this expense?")) {
        const expenses = loadExpenses();
        expenses.splice(index, 1); 
        saveExpenses(expenses);
        renderExpenses(); 
    }
};
 
 
// --- Display and Render Function (Unchanged) ---
 
function renderExpenses() {
    const expenses = loadExpenses();
    const expenseListBody = document.getElementById('expenseList');
    expenseListBody.innerHTML = ''; 
    
    editingIndex = null; 
 
    expenses.forEach((expense, index) => {
        const row = expenseListBody.insertRow();
        
        row.insertCell().textContent = expense.date;
        row.insertCell().textContent = expense.category;
        row.insertCell().textContent = expense.description;
        row.insertCell().textContent = parseFloat(expense.amount).toFixed(2); 
 
        const actionCell = row.insertCell();
        actionCell.innerHTML = `
            <button onclick="editExpense(${index})">Edit</button>
            <button onclick="deleteExpense(${index})">Delete</button>
        `;
    });
    
    calculateTotal(expenses); 
    document.getElementById('addExpenseBtn').textContent = 'Add Expense';
}
 
// --- Event Listeners (Logic moved into DOMContentLoaded) ---
 
// PDF Download Logic (Unchanged, but now only runs on index.html)
function setupMainAppListeners() {
    // 1. Form Submission (Handles BOTH Add and Update)
    const expenseForm = document.getElementById('expenseForm');
    expenseForm.addEventListener('submit', function(event) {
        event.preventDefault(); 
 
        const newExpense = {
            date: document.getElementById('date').value,
            category: document.getElementById('category').value,
            amount: document.getElementById('amount').value,
            description: document.getElementById('description').value,
        };
 
        const expenses = loadExpenses();
 
        if (editingIndex !== null) {
            expenses[editingIndex] = newExpense;
        } else {
            expenses.push(newExpense);
        }
        
        saveExpenses(expenses);
        renderExpenses();
        expenseForm.reset();
        editingIndex = null; 
    });
 
    // 2. PDF Download Button
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    downloadPdfBtn.addEventListener('click', function() {
        const element = document.getElementById('expenseReport');
        
        // Hide elements for clean PDF generation
        document.getElementById('expenseForm').style.display = 'none';
        downloadPdfBtn.style.display = 'none';
        document.getElementById('newReportBtn').style.display = 'none';
        
        const table = document.getElementById('expenseTable');
        if (table) {
            table.querySelectorAll('th:last-child, td:last-child').forEach(el => {
                el.style.display = 'none';
            });
        }
 
        const options = {
            margin:       10,
            filename:     'Report_' + document.getElementById('reportIdDisplay').textContent + '.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
 
        html2pdf()
            .set(options)
            .from(element)
            .save()
            .then(() => {
                // Restore hidden elements
                document.getElementById('expenseForm').style.display = 'block';
                downloadPdfBtn.style.display = 'block';
                document.getElementById('newReportBtn').style.display = 'block';
                
                if (table) {
                    table.querySelectorAll('th:last-child, td:last-child').forEach(el => {
                        el.style.display = '';
                    });
                }
            });
    });
 
    // 3. New Report Button
    document.getElementById('newReportBtn').addEventListener('click', window.startNewReport);
 
}
 
 
// --- Initial Page Load/Router ---
 
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication status first on all pages
    checkAuth(); 
 
    // Determine the current page to run page-specific logic
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
 
    if (currentPage === 'login.html' || currentPage === '') {
        // Logic for the Login Page
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', function(event) {
                event.preventDefault();
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                attemptLogin(username, password);
            });
        }
    } else if (currentPage === 'index.html') {
        // Logic for the Main App Page
        manageReportId(); 
        renderExpenses(); 
        setupMainAppListeners(); // Set up all buttons and form logic for the main app
    }
});
 