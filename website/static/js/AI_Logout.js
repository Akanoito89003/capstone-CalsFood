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

        // Send the image to the server
        fetch('/predict', {
            method: 'POST',
            body: formData,
            redirect: 'follow'
        })
        .then(response => {
            // ถ้า server redirect จะได้ response.type === 'opaqueredirect'
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
            // Reset button state
            uploadBtn.textContent = originalText;
            uploadBtn.disabled = false;
        });
    }
});