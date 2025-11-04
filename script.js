// Function to load expenses from local storage
function loadExpenses() {
    // Tries to get the data, or returns an empty array if none is found
    const expensesJSON = localStorage.getItem('expenseClaims');
    return expensesJSON ? JSON.parse(expensesJSON) : [];
}
 
// Function to save expenses to local storage
function saveExpenses(expenses) {
    localStorage.setItem('expenseClaims', JSON.stringify(expenses));
}
 
// Function to render the expenses in the table
function renderExpenses() {
    const expenses = loadExpenses();
    const expenseListBody = document.getElementById('expenseList');
    expenseListBody.innerHTML = ''; // Clear existing list
 
    expenses.forEach(expense => {
        const row = expenseListBody.insertRow();
        
        row.insertCell().textContent = expense.date;
        row.insertCell().textContent = expense.category;
        row.insertCell().textContent = expense.description;
        // Format amount to two decimal places
        row.insertCell().textContent = parseFloat(expense.amount).toFixed(2); 
    });
}
 
// --- Event Listener for Adding a New Expense ---
const expenseForm = document.getElementById('expenseForm');
 
expenseForm.addEventListener('submit', function(event) {
    event.preventDefault(); 
 
    // 1. Collect new expense data
    const newExpense = {
        date: document.getElementById('date').value,
        category: document.getElementById('category').value,
        amount: document.getElementById('amount').value,
        description: document.getElementById('description').value,
    };
 
    // 2. Add to storage and re-render
    const expenses = loadExpenses();
    expenses.push(newExpense);
    saveExpenses(expenses);
    renderExpenses();
 
    // 3. Clear the form
    expenseForm.reset();
});
 
// --- Event Listener for PDF Download ---
const downloadPdfBtn = document.getElementById('downloadPdfBtn');
 
downloadPdfBtn.addEventListener('click', function() {
    const element = document.getElementById('expenseReport');
    
    // Hide the form and the PDF button before generating (so they aren't in the report)
    document.getElementById('expenseForm').style.display = 'none';
    downloadPdfBtn.style.display = 'none';
    
    // PDF Configuration
    const options = {
        margin:       10,
        filename:     'Consolidated_Expense_Report_' + new Date().toISOString().slice(0, 10) + '.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
 
    // Generate PDF from the entire container
    html2pdf()
        .set(options)
        .from(element)
        .save()
        .then(() => {
            // Bring the form and button back after the PDF is generated
            document.getElementById('expenseForm').style.display = 'block';
            downloadPdfBtn.style.display = 'block';
        });
});
 
// Load and display any saved expenses when the page first loads
document.addEventListener('DOMContentLoaded', renderExpenses);
 