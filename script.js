// --- Global State and Constants ---
let editingIndex = null; // Tracks the index of the item currently being edited (null = adding a new item)
const REPORT_ID_KEY = 'currentReportId';
const EXPENSES_KEY = 'expenseClaims';
 
// --- Core Utility Functions ---
 
// Generate a unique ID (e.g., EXP-12345)
function generateUniqueId() {
    return 'EXP-' + Math.floor(Math.random() * 90000 + 10000);
}
 
// Load expenses from the browser's local storage
function loadExpenses() {
    const expensesJSON = localStorage.getItem(EXPENSES_KEY);
    return expensesJSON ? JSON.parse(expensesJSON) : [];
}
 
// Save the current expenses array back to local storage
function saveExpenses(expenses) {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
}
 
// --- ID and Report Management ---
 
// Load, generate, and display the Report ID
function manageReportId() {
    let reportId = localStorage.getItem(REPORT_ID_KEY);
    
    if (!reportId) {
        // If no ID exists (new report or first visit), generate one
        reportId = generateUniqueId();
        localStorage.setItem(REPORT_ID_KEY, reportId);
    }
    
    document.getElementById('reportIdDisplay').textContent = reportId;
}
 
// Clear all data and start a new report
window.startNewReport = function() {
    if (confirm("Are you sure you want to clear all data and start a NEW REPORT? This action cannot be undone.")) {
        // Clear all relevant keys in local storage
        localStorage.removeItem(EXPENSES_KEY);
        localStorage.removeItem(REPORT_ID_KEY);
        
        // Regenerate ID and re-render an empty table
        manageReportId();
        renderExpenses(); 
    }
};
 
// --- CRUD Operations ---
 
// Calculate and display the total amount
function calculateTotal(expenses) {
    let total = 0;
    expenses.forEach(expense => {
        total += parseFloat(expense.amount) || 0; 
    });
    document.getElementById('totalAmount').textContent = '$' + total.toFixed(2);
}
 
// Populate the form with data for editing
window.editExpense = function(index) {
    const expenses = loadExpenses();
    const expense = expenses[index];
 
    document.getElementById('date').value = expense.date;
    document.getElementById('category').value = expense.category;
    document.getElementById('amount').value = expense.amount;
    document.getElementById('description').value = expense.description;
 
    // Mark the index of the item being edited
    editingIndex = index; 
 
    // Update button text to give user feedback
    document.getElementById('addExpenseBtn').textContent = 'Update Expense';
};
 
// Delete an expense
window.deleteExpense = function(index) {
    if (confirm("Are you sure you want to delete this expense?")) {
        const expenses = loadExpenses();
        // Remove 1 item starting at the given index
        expenses.splice(index, 1); 
        saveExpenses(expenses);
        renderExpenses(); // Update the display
    }
};
 
 
// --- Display and Render Function ---
 
function renderExpenses() {
    const expenses = loadExpenses();
    const expenseListBody = document.getElementById('expenseList');
    expenseListBody.innerHTML = ''; 
    
    // Ensure editing state is reset when the list is drawn
    editingIndex = null; 
 
    expenses.forEach((expense, index) => {
        const row = expenseListBody.insertRow();
        
        row.insertCell().textContent = expense.date;
        row.insertCell().textContent = expense.category;
        row.insertCell().textContent = expense.description;
        row.insertCell().textContent = parseFloat(expense.amount).toFixed(2); 
 
        // Insert Edit and Delete Buttons
        const actionCell = row.insertCell();
        actionCell.innerHTML = `
            <button onclick="editExpense(${index})">Edit</button>
            <button onclick="deleteExpense(${index})">Delete</button>
        `;
    });
    
    calculateTotal(expenses); 
    document.getElementById('addExpenseBtn').textContent = 'Add Expense';
}
 
// --- Event Listeners ---
 
// Form Submission (Handles BOTH Add and Update)
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
        // UPDATE: Replace the item at the saved index
        expenses[editingIndex] = newExpense;
    } else {
        // ADD: Add the new item to the end of the array
        expenses.push(newExpense);
    }
    
    saveExpenses(expenses);
    renderExpenses();
    expenseForm.reset();
    editingIndex = null; // Crucial: clear editing state
});
 
 
// PDF Download Logic
const downloadPdfBtn = document.getElementById('downloadPdfBtn');
 
downloadPdfBtn.addEventListener('click', function() {
    const element = document.getElementById('expenseReport');
    
    // Hide buttons and form so they don't appear in the PDF
    document.getElementById('expenseForm').style.display = 'none';
    downloadPdfBtn.style.display = 'none';
    document.getElementById('newReportBtn').style.display = 'none';
    
    // Temporary CSS to hide the last column (Actions) when generating the PDF
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
            // Restore hidden elements after PDF generation
            document.getElementById('expenseForm').style.display = 'block';
            downloadPdfBtn.style.display = 'block';
            document.getElementById('newReportBtn').style.display = 'block';
            
            // Restore the Actions column display properties
            if (table) {
                table.querySelectorAll('th:last-child, td:last-child').forEach(el => {
                    el.style.display = ''; // Reset to default display
                });
            }
        });
});
 
// Initial Page Load
document.addEventListener('DOMContentLoaded', () => {
    manageReportId(); // Load or generate the ID
    renderExpenses(); // Load and display the saved expenses
    
    // Set up the event listener for the New Report button
    document.getElementById('newReportBtn').addEventListener('click', window.startNewReport);
});
 