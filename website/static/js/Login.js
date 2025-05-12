document.addEventListener('DOMContentLoaded', function() {
    const togglePassword = document.getElementById('togglePassword');
    const password = document.getElementById('password');
    const email = document.getElementById('email');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const loginForm = document.querySelector('form');

    // Toggle password visibility
    togglePassword.addEventListener('click', function() {
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);
        this.src = type === 'password' 
            ? 'https://cdn-icons-png.flaticon.com/512/2767/2767146.png'
            : 'https://cdn-icons-png.flaticon.com/512/2767/2767194.png';
    });

    // Handle form submission
    loginForm.addEventListener('submit', function(event) {
        let hasError = false;

        // Clear previous errors
        emailError.classList.remove('show');
        passwordError.classList.remove('show');
        email.classList.remove('error');
        password.classList.remove('error');

        // Basic validation
        if (!email.value) {
            emailError.textContent = 'กรุณากรอกอีเมล';
            emailError.classList.add('show');
            email.classList.add('error');
            hasError = true;
        }

        if (!password.value) {
            passwordError.textContent = 'กรุณากรอกรหัสผ่าน';
            passwordError.classList.add('show');
            password.classList.add('error');
            hasError = true;
        }

        if (hasError) {
            event.preventDefault();
        }
    });

    // Clear error messages when user starts typing
    email.addEventListener('input', function() {
        emailError.classList.remove('show');
        email.classList.remove('error');
    });

    password.addEventListener('input', function() {
        passwordError.classList.remove('show');
        password.classList.remove('error');
    });

    // Check for error messages from server
    const urlParams = new URLSearchParams(window.location.search);
    const emailErrorMsg = urlParams.get('email_error');
    const passwordErrorMsg = urlParams.get('password_error');

    if (emailErrorMsg) {
        emailError.textContent = emailErrorMsg;
        emailError.classList.add('show');
        email.classList.add('error');
    }

    if (passwordErrorMsg) {
        passwordError.textContent = passwordErrorMsg;
        passwordError.classList.add('show');
        password.classList.add('error');
    }
}); 