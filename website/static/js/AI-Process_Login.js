document.getElementById('file-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const imageUrl = URL.createObjectURL(file);
        const foodImage = document.querySelector('.food-image img');
        if (foodImage) {
            foodImage.src = imageUrl;
        }
    }
});

// Handle save button click with custom modal
const saveModal = document.getElementById('saveModal');
const successModal = document.getElementById('successModal');
const confirmSave = document.getElementById('confirmSave');
const cancelSave = document.getElementById('cancelSave');
const datetimeInput = document.getElementById('datetime');

// Set default datetime to now
if (datetimeInput) {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    datetimeInput.value = now.toISOString().slice(0, 16);
}

function validateForm() {
    return datetimeInput.value !== '';
}

function showModal(modal) {
    modal.style.display = 'flex';
    modal.offsetHeight;
    modal.classList.add('show');
}

function hideModal(modal) {
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Event Listeners
if (saveModal && confirmSave && cancelSave) {
    cancelSave.addEventListener('click', function() {
        hideModal(saveModal);
    });

    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === saveModal) {
            hideModal(saveModal);
        } else if (event.target === successModal) {
            hideModal(successModal);
            setTimeout(() => {
                window.location.href = '/inventory';
            }, 300);
        }
    });

    // Close success modal and redirect to inventory
    successModal.addEventListener('click', function() {
        hideModal(successModal);
        setTimeout(() => {
            window.location.href = '/inventory';
        }, 300);
    });
}

document.getElementById('upload-new-image-btn').addEventListener('click', function() {
    document.getElementById('file-input').click();
});

document.getElementById('file-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('image', file);
        fetch('/predict', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.redirected) {
                window.location.href = response.url;
            } else {
                return response.json();
            }
        })
        .then(data => {
            if (data && !data.success) {
                alert(data.message);
            }
        })
        .catch(error => {
            alert('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ');
        });
    }
});

document.getElementById('save-menu-btn').addEventListener('click', function() {
    document.getElementById('saveModal').style.display = 'flex';
    setTimeout(() => document.getElementById('saveModal').classList.add('show'), 10);
});

document.getElementById('confirmSave').addEventListener('click', function() {
    const menuName = document.getElementById('edit-menu-name').value;
    const datetime = document.getElementById('datetime').value;
    const totalCalories = parseFloat(document.querySelector('.total-value').textContent);
    const ingredients = Array.from(document.querySelectorAll('.ingredient-item')).map(item => ({
        name: item.querySelector('.ingredient-name').textContent,
        calories: parseFloat(item.querySelector('.calorie-value').textContent)
    }));
    if (!menuName || !datetime || ingredients.length === 0) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }
    fetch('/save-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            menu_name: menuName,
            datetime: datetime,
            total_calories: totalCalories,
            ingredients: ingredients
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = '/inventory';
        } else {
            alert('เกิดข้อผิดพลาดในการบันทึก: ' + data.error);
        }
    })
    .catch(error => {
        alert('เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่อีกครั้ง');
    });
});

document.getElementById('cancelSave').addEventListener('click', function() {
    document.getElementById('saveModal').classList.remove('show');
    setTimeout(() => document.getElementById('saveModal').style.display = 'none', 300);
});

document.getElementById('edit-ingredients-btn').addEventListener('click', function() {
    document.getElementById('editIngredientsModal').style.display = 'flex';
    setTimeout(() => document.getElementById('editIngredientsModal').classList.add('show'), 10);
});

document.getElementById('cancelEditIngredients').addEventListener('click', function() {
    document.getElementById('editIngredientsModal').classList.remove('show');
    setTimeout(() => document.getElementById('editIngredientsModal').style.display = 'none', 300);
});

document.getElementById('confirmEditIngredients').addEventListener('click', function() {
    // เก็บ ingredients ลง localStorage แล้ว redirect ไป /design
    const ingredients = Array.from(document.querySelectorAll('.ingredient-item')).map(item => ({
        name: item.querySelector('.ingredient-name').textContent,
        calories: parseFloat(item.querySelector('.calorie-value').textContent)
    }));
    localStorage.setItem('predicted_ingredients', JSON.stringify(ingredients));
    // เก็บชื่อเมนูด้วย
    const menuName = document.getElementById('edit-menu-name') ? document.getElementById('edit-menu-name').value : (document.querySelector('.food-info h2')?.textContent.replace('Menu: ', '') || '');
    if (menuName) localStorage.setItem('predicted_menu_name', menuName);
    window.location.href = '/design';
});