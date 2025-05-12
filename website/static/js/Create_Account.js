document.addEventListener('DOMContentLoaded', function() {
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const password = document.getElementById('create-password');
    const confirmPassword = document.getElementById('create-confirm-password');
    const birthdayInput = document.getElementById('create-birthday');

    // Set max date to last year
    const today = new Date();
    const lastYear = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    birthdayInput.max = lastYear.toISOString().split('T')[0];

    function togglePasswordVisibility(inputField, toggleButton) {
        const type = inputField.getAttribute('type') === 'password' ? 'text' : 'password';
        inputField.setAttribute('type', type);
        toggleButton.src = type === 'password' 
            ? 'https://cdn-icons-png.flaticon.com/512/2767/2767146.png'
            : 'https://cdn-icons-png.flaticon.com/512/2767/2767194.png';
    }

    togglePassword.addEventListener('click', function() {
        togglePasswordVisibility(password, this);
    });

    toggleConfirmPassword.addEventListener('click', function() {
        togglePasswordVisibility(confirmPassword, this);
    });

    // Add birthday validation
    birthdayInput.addEventListener('change', function() {
        const selectedDate = new Date(this.value);
        const currentYear = new Date().getFullYear();
        
        if (selectedDate.getFullYear() >= currentYear) {
            this.setCustomValidity('Birthday cannot be in the current year or future');
        } else {
            this.setCustomValidity('');
        }
    });
}); 