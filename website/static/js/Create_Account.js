document.addEventListener('DOMContentLoaded', function() {
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const password = document.getElementById('create-password');
    const confirmPassword = document.getElementById('create-confirm-password');
    const birthdayInput = document.getElementById('create-birthday');

    // Set max date to today
    try {
        birthdayInput.max = new Date().toISOString().split('T')[0];
    } catch (e) {
        console.error("Could not set max date for birthday input.");
    }

    function togglePasswordVisibility(inputField, toggleButton) {
        const type = inputField.getAttribute('type') === 'password' ? 'text' : 'password';
        inputField.setAttribute('type', type);
        toggleButton.src = type === 'password' 
            ? 'https://cdn-icons-png.flaticon.com/512/2767/2767146.png'
            : 'https://cdn-icons-png.flaticon.com/512/709/709612.png';
    }

    if (togglePassword && password) {
        togglePassword.addEventListener('click', function() {
            togglePasswordVisibility(password, this);
        });
    }

    if (toggleConfirmPassword && confirmPassword) {
        toggleConfirmPassword.addEventListener('click', function() {
            togglePasswordVisibility(confirmPassword, this);
        });
    }

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