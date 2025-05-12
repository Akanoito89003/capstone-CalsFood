/******************************** Profile setting (ขีด 3 ขีด)  ***********************************/
document.addEventListener("DOMContentLoaded", function () {
    const settingIcon = document.getElementById("setting");
    const settingsMenu = document.createElement("div");

    // Get URLs from data attributes
    const profileUrl = document.querySelector('.account').dataset.profileUrl;
    const logoutUrl = document.querySelector('.account').dataset.logoutUrl;

    settingsMenu.classList.add("settings-menu");
    settingsMenu.innerHTML = `
        <a href="${profileUrl}">ตั้งค่าโปรไฟล์</a>
        <a href="#" id="logout-link">ออกจากระบบ</a>
    `;

    document.querySelector(".account").appendChild(settingsMenu);

    settingIcon.addEventListener("click", function () {
        settingsMenu.classList.toggle("show-menu");
    });

    // Add logout confirmation
    const logoutLink = document.getElementById("logout-link");
    logoutLink.addEventListener("click", function(e) {
        e.preventDefault();
        if (confirm("คุณต้องการออกจากระบบหรือไม่?")) {
            window.location.href = logoutUrl;
        }
    });

    // ปิดเมนูเมื่อคลิกข้างนอก
    document.addEventListener("click", function (event) {
        if (!settingIcon.contains(event.target) && !settingsMenu.contains(event.target)) {
            settingsMenu.classList.remove("show-menu");
        }
    });
});
 
