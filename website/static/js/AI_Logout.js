document.getElementById('file-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        // Here you can handle the selected file
        console.log('Selected file:', file.name);
        // You can add preview functionality here if needed
    }
});