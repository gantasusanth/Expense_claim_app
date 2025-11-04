// --- Core Data Management Functions ---
 
// Global variable to track if we are currently editing an expense
let editingIndex = null;
 
function loadExpenses() {
    const expensesJSON = localStorage.getItem('expenseClaims');
    return expensesJSON ? JSON.parse(expensesJSON) : [];
}
 
function saveExpenses(expenses) {
    localStorage.setItem('expenseClaims', JSON.stringify(expenses));
}
 
function calculateTotal(expenses) {
    let total = 0;
    
    expenses.forEach(expense => {
        total += parseFloat(expense.amount) || 0; 
    });
    
    document.getElementById('totalAmount').textContent = '$' + total.toFixed(2);
}
 
// --- EDIT and DELETE Functions ---
 
// Set the form fields with data and mark the item for replacement
window.editExpense = function(index) {
    const expenses = loadExpenses();
    const expense = expenses[index];
 
    // Populate the form fields with the selected expense data
    document.getElementById('date').value = expense.date;
    document.getElementById('category').value = expense.category;
    document.getElementById('amount').value = expense.amount;
    document.getElementById('description').value = expense.description;
 
    // Set the global index to remember which item is being edited
    editingIndex = index; 
 
    // Update button text to reflect the action
    document.getElementById('addExpenseBtn').textContent = 'Update Expense';
};
 
// Permanently remove an expense from the list
window.deleteExpense = function(index) {
    if (confirm("Are you sure you want to delete this expense?")) {
        const expenses = loadExpenses();
        // Remove the item at the specific index
        expenses.splice(index, 1); 
        saveExpenses(expenses);
        renderExpenses(); // Re-render the list
    }
};
 
// 4. Function to display the saved expenses in the HTML table
function renderExpenses() {
    const expenses = loadExpenses();
    const expenseListBody = document.getElementById('expenseList');
    expenseListBody.innerHTML = ''; 
    
    // Clear editing state when re-rendering
    editingIndex = null; 
 
    expenses.forEach((expense, index) => {
        const row = expenseListBody.insertRow();
        
        row.insertCell().textContent = expense.date;
        row.insertCell().textContent = expense.category;
        row.insertCell().textContent = expense.description;
        row.insertCell().textContent = parseFloat(expense.amount).toFixed(2); 
 
        // CRITICAL NEW CODE: Add Edit and Delete Buttons
        const actionCell = row.insertCell();
        actionCell.innerHTML = `
            <button onclick="editExpense(${index})" style="width: 45%; padding: 5px; margin-right: 5%;">Edit</button>
            <button onclick="deleteExpense(${index})" style="width: 45%; padding: 5px; margin: 0; background-color: #dc3545;">Delete</button>
        `;
    });
    
    calculateTotal(expenses); 
    
    // Reset the button label to 'Add Expense'
    document.getElementById('addExpenseBtn').textContent = 'Add Expense';
}
 
// --- Event Listener for Adding/Updating an Expense (Form Submission) ---
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
        // If we are editing, replace the old item with the new data
        expenses[editingIndex] = newExpense;
    } else {
        // Otherwise, add the new item to the end
        expenses.push(newExpense);
    }
    
    saveExpenses(expenses);
    renderExpenses();
    expenseForm.reset();
    editingIndex = null; // Clear editing state
});
 
// --- Event Listener for PDF Download Button (Unchanged) ---
const downloadPdfBtn = document.getElementById('downloadPdfBtn');
 
downloadPdfBtn.addEventListener('click', function() {
    const element = document.getElementById('expenseReport');
    
    document.getElementById('expenseForm').style.display = 'none';
    downloadPdfBtn.style.display = 'none';
    
    const options = {
        margin:       10,
        filename:     'Consolidated_Expense_Report_' + new Date().toISOString().slice(0, 10) + '.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
 
    html2pdf()
        .set(options)
        .from(element)
        .save()
        .then(() => {
            document.getElementById('expenseForm').style.display = 'block';
            downloadPdfBtn.style.display = 'block';
        });
});
 
// CRITICAL: Run this function once the page is loaded
document.addEventListener('DOMContentLoaded', renderExpenses);
 