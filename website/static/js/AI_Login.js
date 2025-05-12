document.getElementById('file-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('image', file);

        // แสดง loading message
        const uploadArea = document.querySelector('.upload-area');
        uploadArea.innerHTML = '<p>กำลังประมวลผล...</p>';

        fetch('/predict', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.redirected) {
                // ถ้า redirect ให้ไปที่หน้า ai-process
                window.location.href = response.url;
            } else {
                // ถ้าไม่ redirect ให้อ่าน response เป็น JSON
                return response.json();
            }
        })
        .then(data => {
            if (data && !data.success) {
                // แสดง error message
                alert(data.message);
                // รีเซ็ต upload area
                const uploadArea = document.querySelector('.upload-area');
                uploadArea.innerHTML = `
                    <img src="/static/Image/icon-image.png" class="upload-icon">
                    <input type="file" id="file-input" accept="image/*" style="display: none">
                    <button class="upload-btn" onclick="document.getElementById('file-input').click()">อัพโหลดรูปภาพ</button>
                `;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('เกิดข้อผิดพลาดในการประมวลผลรูปภาพ');
            // รีเซ็ต upload area
            const uploadArea = document.querySelector('.upload-area');
            uploadArea.innerHTML = `
                <img src="/static/Image/icon-image.png" class="upload-icon">
                <input type="file" id="file-input" accept="image/*" style="display: none">
                <button class="upload-btn" onclick="document.getElementById('file-input').click()">อัพโหลดรูปภาพ</button>
            `;
        });
    }
});