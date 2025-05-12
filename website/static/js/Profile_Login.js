let isEditMode = false;
let isPasswordChangeMode = false;

function toggleEditMode() {
    const displayValues = document.querySelectorAll('.display-value');
    const editInputs = document.querySelectorAll('.edit-input');
    const editButton = document.querySelector('.edit-button');
    const saveButton = document.querySelector('.save-button');
    const cancelButton = document.querySelector('.cancel-button');
    const changePasswordButton = document.querySelector('.change-password-button');
    const profileImageButtons = document.querySelector('.profile-image-container .button-group');

    // Scroll to top
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

    if (displayValues[0].style.display === 'none') {
        // Switch to view mode
        displayValues.forEach(p => p.style.display = 'block');
        editInputs.forEach(input => {
            input.style.display = 'none';
            input.closest('.info-box').classList.remove('editable');
        });
        editButton.style.display = 'block';
        saveButton.style.display = 'none';
        cancelButton.style.display = 'none';
        changePasswordButton.style.display = 'block';
        if (profileImageButtons) {
            profileImageButtons.style.display = 'none';
        }
    } else {
        // Switch to edit mode
        displayValues.forEach(p => p.style.display = 'none');
        editInputs.forEach(input => {
            input.style.display = 'block';
            input.closest('.info-box').classList.add('editable');
        });
        editButton.style.display = 'none';
        saveButton.style.display = 'block';
        cancelButton.style.display = 'block';
        changePasswordButton.style.display = 'none';
        if (profileImageButtons) {
            profileImageButtons.style.display = 'flex';
        }
    }
}

function togglePasswordChange() {
    const profileView = document.querySelector('.profile-view');
    const passwordForm = document.querySelector('.password-change-form');
    const editButton = document.querySelector('.edit-button');
    const changePasswordButton = document.querySelector('.change-password-button');
    const savePasswordButton = document.querySelector('.save-password-button');
    const cancelPasswordButton = document.querySelector('.cancel-password-button');
    const headerText = document.querySelector('.box p');
    const profileImageSection = document.querySelector('.info-item:first-child');

    // Clear any existing error messages
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(error => error.style.display = 'none');

    // Clear password inputs
    const passwordInputs = document.querySelectorAll('.password-input');
    passwordInputs.forEach(input => input.value = '');

    // Scroll to top
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

    // Toggle visibility
    if (profileView.style.display !== 'none') {
        // Switch to password change view
        profileView.style.display = 'none';
        passwordForm.style.display = 'block';
        editButton.style.display = 'none';
        changePasswordButton.style.display = 'none';
        savePasswordButton.style.display = 'block';
        cancelPasswordButton.style.display = 'block';
        headerText.textContent = 'Change Password';
        if (profileImageSection) {
            profileImageSection.style.display = 'none';
        }
    } else {
        // Switch back to profile view
        profileView.style.display = 'block';
        passwordForm.style.display = 'none';
        editButton.style.display = 'block';
        changePasswordButton.style.display = 'block';
        savePasswordButton.style.display = 'none';
        cancelPasswordButton.style.display = 'none';
        headerText.textContent = 'User Profile';
        if (profileImageSection) {
            profileImageSection.style.display = 'block';
        }
    }
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    errorElement.previousElementSibling.classList.add('error');
}

function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    errorElement.style.display = 'none';
    errorElement.previousElementSibling.classList.remove('error');
}

function showProfileUpdatePopup() {
    const popup = document.getElementById('profile-update-popup');
    if (popup) {
        popup.style.display = 'flex';
    }
}

function hideProfileUpdatePopup() {
    const popup = document.getElementById('profile-update-popup');
    if (popup) {
        popup.style.display = 'none';
    }
}

// Profile Image Upload and Delete Functions
let tempProfileImage = null;

function handleProfileImageUpload(event) {
    if (this.files && this.files[0]) {
        const file = this.files[0];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showCustomAlert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showCustomAlert('ขนาดไฟล์ต้องไม่เกิน 5MB');
            return;
        }

        // Preview image
        const reader = new FileReader();
        reader.onload = function(e) {
            document.querySelector('.profile-image').src = e.target.result;
            tempProfileImage = file; // Store the file temporarily
        }
        reader.readAsDataURL(file);
    }
}

function deleteProfileImage() {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบภาพโปรไฟล์ของคุณ?')) {
        document.querySelector('.profile-image').src = "/static/profile_pics/default.png";
        tempProfileImage = 'delete'; // Mark for deletion
    }
}

function saveProfileImage() {
    if (tempProfileImage === null) {
        return; // No changes to save
    }

    const formData = new FormData();
    
    if (tempProfileImage === 'delete') {
        // Delete profile image
        fetch('/delete-profile-image', {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update both profile images (in profile and header)
                const profileImages = document.querySelectorAll('.profile-image, #icon-profile');
                profileImages.forEach(img => {
                    img.src = "/static/profile_pics/default.png";
                });
                showCustomAlert('ลบรูปโปรไฟล์สำเร็จ');
                tempProfileImage = null;
            } else {
                showCustomAlert('เกิดข้อผิดพลาดในการลบรูป');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showCustomAlert('เกิดข้อผิดพลาดในการลบรูป');
        });
    } else {
        // Upload new profile image
        formData.append('profile_image', tempProfileImage);
        
        fetch('/upload-profile-image', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Get the new image URL
                const newImageUrl = `/static/profile_pics/user_${data.user_id}_${tempProfileImage.name}`;
                
                // Update both profile images (in profile and header)
                const profileImages = document.querySelectorAll('.profile-image, #icon-profile');
                profileImages.forEach(img => {
                    img.src = newImageUrl;
                });
                
                showCustomAlert('อัพโหลดรูปโปรไฟล์สำเร็จ');
                tempProfileImage = null;
            } else {
                showCustomAlert('เกิดข้อผิดพลาดในการอัพโหลดรูป');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showCustomAlert('เกิดข้อผิดพลาดในการอัพโหลดรูป');
        });
    }
}

function saveChanges() {
    // Save profile image first
    saveProfileImage();
    
    // Then save other profile changes
    const editInputs = document.querySelectorAll('.edit-input');
    const displayValues = document.querySelectorAll('.display-value');
    
    // Hide all error messages first
    hideError('height-error');
    hideError('weight-error');

    let hasError = false;

    // Check height
    const heightInput = document.querySelector('input[name="user_height"]');
    if (heightInput) {
        const heightValue = parseFloat(heightInput.value);
        if (isNaN(heightValue) || heightValue < 1) {
            showError('height-error', 'ความสูงผิดพลาด');
            hasError = true;
        }
    }

    // Check weight
    const weightInput = document.querySelector('input[name="user_weight"]');
    if (weightInput) {
        const weightValue = parseFloat(weightInput.value);
        if (isNaN(weightValue) || weightValue < 1) {
            showError('weight-error', 'น้ำหนักผิดพลาด');
            hasError = true;
        }
    }

    if (hasError) {
        return;
    }

    // Create form data for the update
    const formData = new FormData();
    formData.append('action', 'update_profile');

    // Get username input specifically
    const usernameInput = document.querySelector('input[name="Username"]');
    if (usernameInput) {
        formData.append('username', usernameInput.value);
        formData.append('Username', usernameInput.value);
    }

    // Get other form inputs
    const inputs = {
        user_height: document.querySelector('input[name="user_height"]'),
        user_weight: document.querySelector('input[name="user_weight"]'),
        user_gender: document.querySelector('select[name="user_gender"]')
    };

    // Append other form data
    Object.entries(inputs).forEach(([key, input]) => {
        if (input && input.value) {
            formData.append(key, input.value);
        }
    });

    // Send update request to server
    fetch(window.location.href, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Update username display in menu bar
            if (usernameInput) {
                const usernameDisplay = document.querySelector('.account p');
                if (usernameDisplay) {
                    usernameDisplay.textContent = usernameInput.value;
                }
            }

            // Update all display values
            displayValues.forEach(display => {
                const container = display.closest('.info-box');
                const input = container.querySelector('input, select');
                if (input) {
                    display.textContent = input.value;
                }
            });

            // Switch back to view mode and show success message
            toggleEditMode();
            showProfileUpdatePopup();
        } else {
            alert('Failed to update profile: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while updating the profile: ' + error.message);
    });
}

function showPopup() {
    const popup = document.querySelector('.popup-overlay');
    if (popup) {
        popup.style.display = 'flex';
    }
}

function hidePopup() {
    const popup = document.querySelector('.popup-overlay');
    if (popup) {
        popup.style.display = 'none';
    }
}

function savePassword() {
    const inputs = document.querySelectorAll('.password-input');
    const currentPassword = inputs[0].value;
    const newPassword = inputs[1].value;
    const confirmPassword = inputs[2].value;

    // Hide all error messages first
    hideError('current-password-error');
    hideError('new-password-error');
    hideError('confirm-password-error');

    let hasError = false;

    // Check if any field is empty
    if (!currentPassword) {
        showError('current-password-error', 'กรุณากรอกรหัสผ่านปัจจุบัน');
        hasError = true;
    }

    if (!newPassword) {
        showError('new-password-error', 'กรุณากรอกรหัสผ่านใหม่');
        hasError = true;
    }

    if (!confirmPassword) {
        showError('confirm-password-error', 'กรุณายืนยันรหัสผ่านใหม่');
        hasError = true;
    }

    if (hasError) {
        return;
    }

    // Check if new password is at least 7 characters
    if (newPassword.length < 7) {
        showError('new-password-error', 'รหัสใหม่ต้องมีตัวอักษรมากกว่าหรือ เท่ากับ 7 ตัวอักษร');
        return;
    }

    // Check if new password and confirm password match
    if (newPassword !== confirmPassword) {
        showError('confirm-password-error', 'รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน');
        return;
    }

    // Create form data for password change
    const formData = new FormData();
    formData.append('action', 'change_password');
    formData.append('current_password', currentPassword);
    formData.append('new_password', newPassword);
    formData.append('confirm_password', confirmPassword);

    // Send password change request to server
    fetch(window.location.href, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showPopup();
            togglePasswordChange();
            // Clear password fields
            inputs.forEach(input => input.value = '');
        } else {
            if (data.message === 'current_password_incorrect') {
                showError('current-password-error', 'รหัสปัจุบันไม่ถูกต้อง');
            } else {
                alert('Failed to change password: ' + data.message);
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while changing the password');
    });
}

function cancelEdit() {
    const editInputs = document.querySelectorAll('.edit-input');
    const displayValues = document.querySelectorAll('.display-value');
    
    // Hide error messages
    hideError('height-error');
    hideError('weight-error');
    
    editInputs.forEach((input, index) => {
        input.value = displayValues[index].textContent;
    });
    
    toggleEditMode();
}

// Add event listeners when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    const editButton = document.querySelector('.edit-button');
    const saveButton = document.querySelector('.save-button');
    const cancelButton = document.querySelector('.cancel-button');
    const changePasswordButton = document.querySelector('.change-password-button');
    const savePasswordButton = document.querySelector('.save-password-button');
    const cancelPasswordButton = document.querySelector('.cancel-password-button');
    const popupButton = document.querySelector('.popup-button');

    // Add toggle password functionality
    const toggleButtons = document.querySelectorAll('.toggle-password');
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                this.src = 'https://cdn-icons-png.flaticon.com/512/2767/2767146.png';
            } else {
                input.type = 'password';
                this.src = 'https://cdn-icons-png.flaticon.com/512/2767/2767146.png';
            }
        });
    });

    if (editButton) editButton.addEventListener('click', function(e) {
        e.preventDefault();
        toggleEditMode();
    });
    
    if (saveButton) saveButton.addEventListener('click', function(e) {
        e.preventDefault();
        saveChanges();
    });
    
    if (cancelButton) cancelButton.addEventListener('click', function(e) {
        e.preventDefault();
        cancelEdit();
    });
    
    if (changePasswordButton) changePasswordButton.addEventListener('click', function(e) {
        e.preventDefault();
        togglePasswordChange();
    });
    
    if (savePasswordButton) savePasswordButton.addEventListener('click', function(e) {
        e.preventDefault();
        savePassword();
    });
    
    if (cancelPasswordButton) cancelPasswordButton.addEventListener('click', function(e) {
        e.preventDefault();
        togglePasswordChange();
    });
    
    if (popupButton) popupButton.addEventListener('click', function() {
        hideProfileUpdatePopup();
    });

    // Add profile image upload event listener
    const profileImageInput = document.getElementById('profile_image');
    if (profileImageInput) {
        profileImageInput.addEventListener('change', handleProfileImageUpload);
    }
}); 