document.getElementById('file-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        // Create URL for the selected file
        const imageUrl = URL.createObjectURL(file);
        // Update the food image
        const foodImage = document.querySelector('.food-image img');
        if (foodImage) {
            foodImage.src = imageUrl;
        }
        console.log('Selected file:', file.name);
    }
});

function handleEditIngredients() {
    // Add your edit ingredients logic here
    console.log('Edit ingredients clicked');
}

function handleSaveMenu() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.style.display = 'flex';
    }
}



// Modal event listeners
document.addEventListener('DOMContentLoaded', function() {
    const loginModal = document.getElementById('loginModal');
    const confirmLogin = document.getElementById('confirmLogin');
    const cancelLogin = document.getElementById('cancelLogin');

    if (confirmLogin) {
        confirmLogin.addEventListener('click', function() {
            window.location.href = 'Login.html';
        });
    }

    if (cancelLogin) {
        cancelLogin.addEventListener('click', function() {
            loginModal.style.display = 'none';
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });
});

