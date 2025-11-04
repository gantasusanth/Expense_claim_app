document.getElementById('expenseForm').addEventListener('submit', function(event) {
    // 1. Prevents the default form submission (which would refresh the page)
    event.preventDefault(); 
    
    // 2. Collects the values entered by the user
    const date = document.getElementById('date').value;
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
 
    // 3. Displays a confirmation message using the collected data
    alert(`Claim Submitted Successfully!\n
Date: ${date}
Category: ${category}
Amount: $${amount}
Description: ${description}`);
 
    // 4. Clears the form fields after submission
    this.reset();
});
 