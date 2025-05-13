document.getElementById('file-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('image', file);

        // Show loading state
        const uploadBtn = document.querySelector('.upload-btn');
        const originalText = uploadBtn.textContent;
        uploadBtn.textContent = 'กำลังวิเคราะห์...';
        uploadBtn.disabled = true;

        fetch('/predict', {
            method: 'POST',
            body: formData,
            redirect: 'follow'
        })
        .then(response => {
            if (response.redirected) {
                window.location.href = response.url;
                return;
            }
            return response.json();
        })
        .then(data => {
            if (data && data.success === false) {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('เกิดข้อผิดพลาดในการวิเคราะห์รูปภาพ');
        })
        .finally(() => {
            uploadBtn.textContent = originalText;
            uploadBtn.disabled = false;
        });
    }
});

function handleEditIngredients() {
    // Get the current menu name and ingredients
    const menuName = document.querySelector('.food-info h2').textContent.replace('Menu: ', '');
    const ingredients = Array.from(document.querySelectorAll('.ingredient-item')).map(item => ({
        name: item.querySelector('.ingredient-name').textContent,
        calories: item.querySelector('.calorie-value').textContent
    }));

    // Store the data in sessionStorage
    sessionStorage.setItem('editMenuData', JSON.stringify({
        menuName: menuName,
        ingredients: ingredients
    }));

    // Redirect to design page
    window.location.href = '/design';
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
            window.location.href = '/login';
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

