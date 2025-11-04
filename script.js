// --- Core Data Management Functions ---
 
// 1. Function to retrieve expenses from local storage
function loadExpenses() {
    const expensesJSON = localStorage.getItem('expenseClaims');
    return expensesJSON ? JSON.parse(expensesJSON) : [];
}
 
// 2. Function to save the entire expense list back to local storage
function saveExpenses(expenses) {
    localStorage.setItem('expenseClaims', JSON.stringify(expenses));
}
 
// 3. Function to calculate the total of all expenses
function calculateTotal(expenses) {
    let total = 0;
    
    // Sum up all amounts. Use || 0 to handle cases where amount might be undefined/NaN.
    expenses.forEach(expense => {
        total += parseFloat(expense.amount) || 0; 
    });
    
    // Update the TOTAL CLAIM AMOUNT element
    document.getElementById('totalAmount').textContent = '$' + total.toFixed(2);
}
 
// 4. Function to display the saved expenses in the HTML table
function renderExpenses() {
    const expenses = loadExpenses();
    const expenseListBody = document.getElementById('expenseList');
    expenseListBody.innerHTML = ''; // Clear the table body first
 
    // Loop through the array and create a row for each expense
    expenses.forEach(expense => {
        const row = expenseListBody.insertRow();
        
        row.insertCell().textContent = expense.date;
        row.insertCell().textContent = expense.category;
        row.insertCell().textContent = expense.description;
        row.insertCell().textContent = parseFloat(expense.amount).toFixed(2); 
    });
    
    // After rendering the rows, update the total amount
    calculateTotal(expenses); 
}
 
// --- Event Listener for Adding a New Expense (Form Submission) ---
const expenseForm = document.getElementById('expenseForm');
 
expenseForm.addEventListener('submit', function(event) {
    event.preventDefault(); 
 
    // 1. Collect new expense data from the form fields
    const newExpense = {
        date: document.getElementById('date').value,
        category: document.getElementById('category').value,
        amount: document.getElementById('amount').value,
        description: document.getElementById('description').value,
    };
 
    // 2. Load existing expenses, add the new one, and save the full list
    const expenses = loadExpenses();
    expenses.push(newExpense);
    saveExpenses(expenses);
    
    // 3. Update the table on the screen and recalculate total
    renderExpenses();
 
    // 4. Clear the input form
    expenseForm.reset();
});
 
// --- Event Listener for PDF Download Button ---
const downloadPdfBtn = document.getElementById('downloadPdfBtn');
 
downloadPdfBtn.addEventListener('click', function() {
    const element = document.getElementById('expenseReport');
    
    // Temporarily hide the input form and the download button before PDF generation
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
 
    // Generate PDF and automatically download it
    html2pdf()
        .set(options)
        .from(element)
        .save()
        .then(() => {
            // After PDF generation, bring the form and button back
            document.getElementById('expenseForm').style.display = 'block';
            downloadPdfBtn.style.display = 'block';
        });
});
 
// CRITICAL: Run this function once the page is loaded to display any previously saved data
document.addEventListener('DOMContentLoaded', renderExpenses);
 