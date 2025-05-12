document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("notes").addEventListener("click", function (event) {
        if (event.target.closest(".delete-note-btn")) {
            let noteId = event.target.closest(".delete-note-btn").getAttribute("data-note-id");

            fetch("/delete-note", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ noteId: noteId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    event.target.closest("li").remove(); // ✅ ลบจากหน้าเว็บโดยไม่ต้อง refresh
                } else {
                    alert("Error deleting note");
                }
            });
        }
    });
});
