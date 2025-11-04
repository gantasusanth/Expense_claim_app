// Target the form element by its ID
const expenseForm = document.getElementById('expenseForm');
 
// Add an event listener to the form submission
expenseForm.addEventListener('submit', function(event) {
    // 1. Prevent the default form submission (which would refresh the page)
    event.preventDefault();
    
    // 2. Hide the submit button temporarily (so it doesn't appear in the PDF)
    const submitButton = this.querySelector('button[type="submit"]');
    submitButton.style.display = 'none';
 
    // 3. Configure the PDF options
    const options = {
        margin:       10,
        filename:     'expense_claim_' + new Date().toISOString().slice(0, 10) + '.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
 
    // 4. Use html2pdf to generate and download the PDF
    // We are targeting the parent element with class 'container' (which holds the whole form)
    html2pdf().set(options).from(document.querySelector('.container')).save();
    
    // 5. Show the button again and reset the form
    setTimeout(() => {
        submitButton.style.display = 'block';
        this.reset();
    }, 100);
    
    // Note: The alert is removed because the PDF download is the new action
});