document.addEventListener("DOMContentLoaded", function () {
    // Meal Icons Object
    const mealIcons = {
        breakfast: [
            "https://cdn-icons-png.flaticon.com/512/1410/1410532.png",
            "https://cdn-icons-png.flaticon.com/512/3480/3480823.png",
            "https://cdn-icons-png.flaticon.com/512/3274/3274099.png",
            "https://cdn-icons-png.flaticon.com/512/12009/12009846.png"
        ],
        lunch: [
            "https://cdn-icons-png.flaticon.com/512/1410/1410532.png",
            "https://cdn-icons-png.flaticon.com/512/3480/3480823.png",
            "https://cdn-icons-png.flaticon.com/512/3274/3274099.png",
            "https://cdn-icons-png.flaticon.com/512/12009/12009846.png"
        ],
        dinner: [
            "https://cdn-icons-png.flaticon.com/512/1410/1410532.png",
            "https://cdn-icons-png.flaticon.com/512/3480/3480823.png",
            "https://cdn-icons-png.flaticon.com/512/3274/3274099.png",
            "https://cdn-icons-png.flaticon.com/512/12009/12009846.png"
        ]
    };

    // Function to create icon options
    function createIconOptions(mealType, selectedIconUrl) {
        const iconOptions = document.createElement('div');
        iconOptions.className = 'icon-options';
        
        mealIcons[mealType].forEach((iconUrl, index) => {
            const img = document.createElement('img');
            img.src = iconUrl;
            img.alt = `${mealType} ${index + 1}`;
            img.dataset.icon = iconUrl;
            if (iconUrl === selectedIconUrl) img.classList.add('selected');
            img.addEventListener('click', function(e) {
                e.stopPropagation();
                // Set selected icon for this mealType
                const iconSelector = img.closest('.icon-selector');
                iconSelector.querySelectorAll('img').forEach(i => i.classList.remove('selected'));
                img.classList.add('selected');
                const mainIcon = iconSelector.querySelector('.meal-icon');
                mainIcon.src = iconUrl;
                // Save icon to editMeals state
                if (editMeals[mealType]) {
                    editMeals[mealType].forEach(meal => {
                        meal.icon_url = iconUrl;
                    });
                    // Set icon_url on the array for new meals
                    editMeals[mealType].icon_url = iconUrl;
                }
            });
            iconOptions.appendChild(img);
        });
        
        return iconOptions;
    }

    // Function to initialize icon selectors
    function initializeIconSelectors() {
        document.querySelectorAll('.icon-selector').forEach(selector => {
            const mealType = selector.closest('.meal-section-edit').classList[1];
            // Set default empty meal icon if no meals, otherwise use current icon
            let selectedIconUrl = editMeals[mealType]?.length > 0 ? 
                (editMeals[mealType][0]?.icon_url || mealIcons[mealType][1]) : 
                mealIcons[mealType][0]; // Use the new empty meal icon as default
            selector.querySelector('.meal-icon').src = selectedIconUrl;
            // Remove old options if any
            const existingOptions = selector.querySelector('.icon-options');
            if (existingOptions) existingOptions.remove();
            selector.appendChild(createIconOptions(mealType, selectedIconUrl));
        });
    }

    // DOM Elements
    const elements = {
        menuHeaders: document.querySelectorAll('.category-header'),
        filterButtons: document.querySelector('.filter-buttons'),
        rightContent: document.querySelector('.right-content'),
        sectionTitle: document.querySelector('.section-title h1'),
        menuGrid: document.querySelector('.menu-grid'),
        deleteButtons: document.querySelectorAll('.delete-menu-btn'),
        deleteMenuConfirmModal: document.getElementById('deleteMenuConfirmModal'),
        deleteDailyMealConfirmModal: document.getElementById('deleteDailyMealConfirmModal'),
        deleteSuccessModal: document.getElementById('deleteSuccessModal'),
        confirmDeleteMenuBtn: document.getElementById('confirmDeleteMenu'),
        cancelDeleteMenuBtn: document.getElementById('cancelDeleteMenu'),
        confirmDeleteDailyMealBtn: document.getElementById('confirmDeleteDailyMeal'),
        cancelDeleteDailyMealBtn: document.getElementById('cancelDeleteDailyMeal'),
        closeSuccessBtn: document.getElementById('closeSuccess'),
        sidebarToggle: document.getElementById('sidebar-toggle'),
        leftContent: document.querySelector('.left-content'),
        fixedHeader: document.querySelector('.fixed-header'),
        editDailyMealModal: document.getElementById('editDailyMealModal'),
        selectMenuModal: document.getElementById('selectMenuModal'),
        cancelEditBtn: document.getElementById('cancelEdit'),
        confirmMenuBtn: document.getElementById('confirmMenu'),
        cancelMenuBtn: document.getElementById('cancelMenu')
    };

    // State variables
    let currentDailyMealCard = null;
    let selectedMealType = null;
    let selectedMenu = null;
    let menuToDelete = null;
    let menuNameToDelete = '';
    let isEdit = false;

    // Button categories for each menu type
    const buttonCategories = {
        'เมนูอาหารของฉัน': [],
        'มื้ออาหารของฉัน': [],
        'สุขภาพของฉัน': []
    };

    // Menu header functionality
    elements.menuHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const menuType = header.querySelector('span').textContent;
            resetMenuHeaders();
            header.classList.add('active');
            updateDisplayedMenuType(menuType);
            updateButtons(menuType);
            scrollToTop();
        });
    });

    // Reset all menu headers
    function resetMenuHeaders() {
        elements.menuHeaders.forEach(header => header.classList.remove('active'));
    }

    // Show or hide search bar based on menu cards and search results
    function showOrHideSearchBar() {
        const searchBar = document.querySelector('.search-bar');
        const menuGrid = document.querySelector('.menu-grid');
        const searchInput = searchBar?.querySelector('input');
        const searchText = searchInput?.value?.toLowerCase() || '';
        const noResultMessage = document.querySelector('.no-search-result-message');
        
        // ถ้าไม่มีเมนูเลย ให้ซ่อน search bar
        if (!menuGrid || !menuGrid.querySelector('.menu-card')) {
            if (searchBar) searchBar.style.display = 'none';
            return;
        }

        // ถ้ามีเมนู ให้แสดง search bar
        if (searchBar) searchBar.style.display = 'block';

        // ถ้ามีการค้นหา ให้ตรวจสอบและแสดงเฉพาะเมนูที่ตรงกับคำค้นหา
        if (searchText) {
            const menuCards = menuGrid.querySelectorAll('.menu-card');
            let hasMatch = false;
            
            menuCards.forEach(card => {
                const menuName = card.querySelector('.menu-name')?.textContent?.toLowerCase() || '';
                if (menuName.includes(searchText)) {
                    card.style.display = 'block';
                    hasMatch = true;
                } else {
                    card.style.display = 'none';
                }
            });

            // ถ้าไม่พบเมนูที่ตรงกับคำค้นหา ให้ซ่อน menu grid และแสดงข้อความ
            if (menuGrid) {
                menuGrid.style.display = hasMatch ? 'flex' : 'none';
                if (!hasMatch) {
                    if (!noResultMessage) {
                        const messageDiv = document.createElement('div');
                        messageDiv.className = 'no-search-result-message';
                        messageDiv.style.textAlign = 'center';
                        messageDiv.style.color = '#888';
                        messageDiv.style.fontSize = '1.1rem';
                        messageDiv.style.margin = '32px 0';
                        messageDiv.textContent = 'ไม่มีชื่อเมนูที่บันทึกไว้';
                        menuGrid.parentNode.insertBefore(messageDiv, menuGrid.nextSibling);
                    } else {
                        noResultMessage.style.display = 'block';
                    }
                } else if (noResultMessage) {
                    noResultMessage.style.display = 'none';
                }
            }
        } else {
            // ถ้าไม่มีการค้นหา ให้แสดง menu grid ทั้งหมดและซ่อนข้อความ
            if (menuGrid) {
                menuGrid.style.display = 'flex';
                menuGrid.querySelectorAll('.menu-card').forEach(card => {
                    card.style.display = 'block';
                });
                if (noResultMessage) {
                    noResultMessage.style.display = 'none';
                }
            }
        }
    }

    // Show or hide daily meal search bar and handle search
    function showOrHideDailyMealSearchBar() {
        const searchBar = document.querySelector('.search-bar');
        const dailyMealContent = document.querySelector('.daily-meal-content');
        const searchInput = searchBar?.querySelector('input');
        const searchText = searchInput?.value?.toLowerCase() || '';
        let noResultMessage = document.querySelector('.no-dailymeal-search-result-message');
        
        // ถ้าไม่มีรายการ Daily Meal เลย ให้ซ่อน search bar
        if (!dailyMealContent || !dailyMealContent.querySelector('.daily-meal-card')) {
            if (searchBar) searchBar.style.display = 'none';
            if (noResultMessage) noResultMessage.style.display = 'none';
            return;
        }

        // ถ้ามีรายการ Daily Meal ให้แสดง search bar
        if (searchBar) searchBar.style.display = 'block';

        // ถ้ามีการค้นหา ให้ตรวจสอบและแสดงเฉพาะ Daily Meal ที่มีเมนูตรงกับคำค้นหา
        if (searchText) {
            const dailyMealCards = dailyMealContent.querySelectorAll('.daily-meal-card');
            let hasMatch = false;
            
            dailyMealCards.forEach(card => {
                const mealSections = card.querySelectorAll('.meal-section');
                let cardHasMatch = false;
                
                mealSections.forEach(section => {
                    const mealItems = section.querySelectorAll('.meal-list-item');
                    mealItems.forEach(item => {
                        const menuName = item.querySelector('.meal-name')?.textContent?.toLowerCase() || '';
                        if (menuName.includes(searchText)) {
                            cardHasMatch = true;
                            hasMatch = true;
                        }
                    });
                });
                // แสดง/ซ่อน Daily Meal card ตามผลการค้นหา
                card.style.display = cardHasMatch ? 'block' : 'none';
            });

            // ถ้าไม่พบเมนูที่ตรงกับคำค้นหาเลย ให้ซ่อน daily meal content และแสดงข้อความ
            if (dailyMealContent) {
                dailyMealContent.style.display = hasMatch ? 'block' : 'none';
                if (!hasMatch) {
                    if (!noResultMessage) {
                        noResultMessage = document.createElement('div');
                        noResultMessage.className = 'no-dailymeal-search-result-message';
                        noResultMessage.style.textAlign = 'center';
                        noResultMessage.style.color = '#888';
                        noResultMessage.style.fontSize = '1.1rem';
                        noResultMessage.style.margin = '32px 0';
                        noResultMessage.textContent = 'ไม่มีชื่อเมนูที่บันทึกไว้';
                        dailyMealContent.parentNode.insertBefore(noResultMessage, dailyMealContent.nextSibling);
                    } else {
                        noResultMessage.style.display = 'block';
                    }
                } else if (noResultMessage) {
                    noResultMessage.style.display = 'none';
                }
            }
        } else {
            // ถ้าไม่มีการค้นหา ให้แสดง daily meal content ทั้งหมดและซ่อนข้อความ
            if (dailyMealContent) {
                dailyMealContent.style.display = 'block';
                dailyMealContent.querySelectorAll('.daily-meal-card').forEach(card => {
                    card.style.display = 'block';
                });
                if (noResultMessage) {
                    noResultMessage.style.display = 'none';
                }
            }
        }
    }

    // Update displayed menu type
    function updateDisplayedMenuType(menuType) {
        // Reset all classes and displays
        elements.rightContent.className = 'right-content';
        document.querySelector('.menu-container').style.display = 'none';
        document.querySelector('.daily-meal-content').style.display = 'none';
        document.querySelector('.healthy-content').style.display = 'none';
        document.querySelector('.search-bar').style.display = 'block';

        // Set specific display based on menu type
        if (menuType === 'เมนูอาหารของฉัน') {
            elements.rightContent.classList.add('my-menu-active');
            document.querySelector('.menu-container').style.display = 'flex';
            sortMenuCards();
            showOrHideSearchBar();
        } else if (menuType === 'มื้ออาหารของฉัน') {
            elements.rightContent.classList.add('daily-meal-active');
            document.querySelector('.daily-meal-content').style.display = 'block';
            sortDailyMealCards();
            showOrHideDailyMealSearchBar();
        } else if (menuType === 'สุขภาพของฉัน') {
            elements.rightContent.classList.add('my-healthy-active');
            document.querySelector('.healthy-content').style.display = 'block';
            document.querySelector('.search-bar').style.display = 'none';
        }
        // Set section title in <h1> only
        if (elements.sectionTitle) {
            elements.sectionTitle.textContent = menuType;
        }
        console.log('sectionTitle:', elements.sectionTitle, 'menuType:', menuType);
    }

    // Update filter buttons based on menu type
    function updateButtons(menuType) {
        elements.filterButtons.innerHTML = '';
        buttonCategories[menuType].forEach(category => {
            const button = document.createElement('button');
            button.className = 'button';
            button.textContent = category;
            if (category === 'All' || category === 'Today' || category === 'BMI') {
                button.classList.add('active');
            }
            elements.filterButtons.appendChild(button);
        });
    }

    // Scroll to top of content
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Sort menu cards by creation date
    function sortMenuCards() {
        const menuGrid = document.querySelector('.menu-grid');
        if (!menuGrid) return; // ป้องกัน error
        const menuCards = Array.from(menuGrid.querySelectorAll('.menu-card'));
        const thaiMonths = {
            'มกราคม': '01', 'กุมภาพันธ์': '02', 'มีนาคม': '03', 'เมษายน': '04',
            'พฤษภาคม': '05', 'มิถุนายน': '06', 'กรกฎาคม': '07', 'สิงหาคม': '08',
            'กันยายน': '09', 'ตุลาคม': '10', 'พฤศจิกายน': '11', 'ธันวาคม': '12'
        };
        menuCards.sort((a, b) => {
            // ดึงวันที่จาก .menu-date หรือ data-created
            let dateA = a.querySelector('.menu-date')?.textContent.replace('Created:', '').trim() || a.getAttribute('data-created') || '';
            let dateB = b.querySelector('.menu-date')?.textContent.replace('Created:', '').trim() || b.getAttribute('data-created') || '';
            // รองรับรูปแบบวันที่ไทย (วันที่ dd เดือน yyyy)
            if (dateA.startsWith('วันที่')) {
                const [_, day, month, year] = dateA.split(' ');
                dateA = `${year}-${thaiMonths[month]}-${day.padStart(2, '0')}`;
            }
            if (dateB.startsWith('วันที่')) {
                const [_, day, month, year] = dateB.split(' ');
                dateB = `${year}-${thaiMonths[month]}-${day.padStart(2, '0')}`;
            }
            // แปลงเป็น Date object
            const dA = new Date(dateA);
            const dB = new Date(dateB);
            return dB - dA;
        });
        menuCards.forEach(card => menuGrid.appendChild(card));
        showOrHideNoMyMenuMessage();
        showOrHideSearchBar();
    }

    // Sort daily meal cards by date
    function sortDailyMealCards() {
        const dailyMealContent = document.querySelector('.daily-meal-content');
        const dailyMealCards = Array.from(dailyMealContent.querySelectorAll('.daily-meal-card'));
        
        // Thai month mapping
        const thaiMonths = {
            'มกราคม': '01', 'กุมภาพันธ์': '02', 'มีนาคม': '03', 'เมษายน': '04',
            'พฤษภาคม': '05', 'มิถุนายน': '06', 'กรกฎาคม': '07', 'สิงหาคม': '08',
            'กันยายน': '09', 'ตุลาคม': '10', 'พฤศจิกายน': '11', 'ธันวาคม': '12'
        };

        dailyMealCards.sort((a, b) => {
            const dateTextA = a.querySelector('.date-info .date').textContent;
            const dateTextB = b.querySelector('.date-info .date').textContent;
            
            // Extract date parts
            const [dayA, monthA, yearA] = dateTextA.replace('วันที่ ', '').split(' ');
            const [dayB, monthB, yearB] = dateTextB.replace('วันที่ ', '').split(' ');
            
            // Convert to comparable date format
            const dateA = new Date(`${yearA}-${thaiMonths[monthA]}-${dayA.padStart(2, '0')}`);
            const dateB = new Date(`${yearB}-${thaiMonths[monthB]}-${dayB.padStart(2, '0')}`);
            
            return dateB - dateA; // Sort in descending order (newest first)
        });
        
        // Reappend sorted cards
        dailyMealCards.forEach(card => dailyMealContent.appendChild(card));
        showOrHideNoDailyMealMessage();
    }

    // Delete functionality for My Menu
    elements.deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const menuCard = this.closest('.menu-card');
            const menuName = menuCard.querySelector('.menu-name').textContent;
            const menuId = this.getAttribute('data-menu-id');
            document.getElementById('deleteMenuName').textContent = menuName;
            menuToDelete = menuId;
            menuNameToDelete = menuName;
            elements.deleteMenuConfirmModal.style.display = 'flex';
        });
    });

    // Handle delete confirmation for My Menu
    elements.confirmDeleteMenuBtn.addEventListener('click', function() {
        if (menuToDelete) {
            fetch(`/delete-menu/${menuToDelete}`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    elements.deleteMenuConfirmModal.style.display = 'none';
                    elements.deleteSuccessModal.style.display = 'flex';
                    // Remove the deleted menu card from the DOM
                    const menuCard = document.querySelector(`.menu-card[data-menu-id="${menuToDelete}"]`);
                    if (menuCard) {
                        menuCard.remove();
                        showOrHideNoMyMenuMessage();
                        showOrHideSearchBar();
                    }
                } else {
                    alert(data.error || 'เกิดข้อผิดพลาดขณะลบเมนู');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('เกิดข้อผิดพลาดขณะลบเมนู กรุณาลองใหม่อีกครั้ง');
            });
        }
    });

    // Cancel delete for My Menu
    elements.cancelDeleteMenuBtn.addEventListener('click', () => {
        elements.deleteMenuConfirmModal.style.display = 'none';
        menuToDelete = null;
        menuNameToDelete = '';
    });

    // Delete functionality for Daily Meal
    document.querySelectorAll('.daily-meal-card .delete-btn').forEach(button => {
        button.addEventListener('click', () => {
            currentDailyMealCard = button.closest('.daily-meal-card');
            elements.deleteDailyMealConfirmModal.style.display = 'flex';
        });
    });

    // Handle delete confirmation for Daily Meal
    elements.confirmDeleteDailyMealBtn.addEventListener('click', () => {
        if (currentDailyMealCard) {
            const dailyId = currentDailyMealCard.querySelector('.delete-btn').getAttribute('data-daily-id');
            fetch(`/daily-meals/${dailyId}`, {method: 'DELETE'})
                .then(res => res.json())
                .then(data => {
                    elements.deleteDailyMealConfirmModal.style.display = 'none';
                    if (data.success) {
                        fetchDailyMeals();
                        showSuccessDailyMealModal('ลบมื้ออาหารสำเร็จ');
                    } else {
                        alert(data.error || 'เกิดข้อผิดพลาดขณะลบมื้ออาหาร');
                    }
                });
        }
    });

    // Cancel delete for Daily Meal
    elements.cancelDeleteDailyMealBtn.addEventListener('click', () => {
        elements.deleteDailyMealConfirmModal.style.display = 'none';
        currentDailyMealCard = null;
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === elements.deleteMenuConfirmModal) {
            elements.deleteMenuConfirmModal.style.display = 'none';
            menuToDelete = null;
            menuNameToDelete = '';
        }
        if (e.target === elements.deleteDailyMealConfirmModal) {
            elements.deleteDailyMealConfirmModal.style.display = 'none';
            currentDailyMealCard = null;
        }
        if (e.target === elements.deleteSuccessModal) {
            elements.deleteSuccessModal.style.display = 'none';
        }
    });

    // State for edit modal
    let editMeals = {
        breakfast: [],
        lunch: [],
        dinner: []
    };

    // Render meal list for a meal type
    function renderMealList(mealType) {
        const mealListDiv = document.querySelector(`.meal-section-edit.${mealType} .meal-list`);
        mealListDiv.innerHTML = '';
        editMeals[mealType].forEach((meal, idx) => {
            const item = document.createElement('div');
            item.className = 'meal-list-item';
            item.dataset.menuId = meal.mymenu_id;
            item.innerHTML = `
                <span class="meal-name">${meal.name}</span>
                <span class="meal-calories">${meal.calories} kcal</span>
                <button class="delete-meal-btn" data-idx="${idx}">
                    <img src="https://cdn-icons-png.flaticon.com/512/3096/3096673.png" alt="Delete">
                </button>
            `;
            item.querySelector('.delete-meal-btn').onclick = () => {
                editMeals[mealType].splice(idx, 1);
                renderMealList(mealType);
                updateTotalCaloriesEdit();
            };
            mealListDiv.appendChild(item);
        });
    }

    // Add meal button functionality
    function setupAddMealBtns() {
        document.querySelectorAll('.meal-section-edit').forEach(section => {
            const btn = section.querySelector('.add-meal-btn');
            if (btn) {
                btn.onclick = () => {
                    selectedMealType = section.classList[1];
                    showMenuSelection();
                };
            }
        });
    }

    // Handle menu selection confirmation
    elements.confirmMenuBtn.addEventListener('click', () => {
        if (selectedMenu && selectedMealType) {
            // Assign icon_url for new menu
            const iconUrl = editMeals[selectedMealType].icon_url || mealIcons[selectedMealType][0];
            editMeals[selectedMealType].push({...selectedMenu, icon_url: iconUrl});
            renderMealList(selectedMealType);
            updateTotalCaloriesEdit();
            elements.selectMenuModal.style.display = 'none';
            elements.editDailyMealModal.style.display = 'flex';
        }
    });

    // Update total calories in edit modal
    function updateTotalCaloriesEdit() {
        let total = 0;
        Object.values(editMeals).forEach(meals => {
            meals.forEach(meal => {
                total += parseInt(meal.calories);
            });
        });
        document.querySelector('.total-calories-edit .total-calorie-value').textContent = total;
    }

    // Populate edit modal with current meal data
    function populateEditModal(card) {
        // Reset editMeals
        editMeals = { breakfast: [], lunch: [], dinner: [] };
        // Set date
        const dateText = card.querySelector('.date-info .date').textContent;
        const [day, month, year] = dateText.replace('วันที่ ', '').split(' ');
        const thaiMonths = {
            'มกราคม': '01', 'กุมภาพันธ์': '02', 'มีนาคม': '03', 'เมษายน': '04',
            'พฤษภาคม': '05', 'มิถุนายน': '06', 'กรกฎาคม': '07', 'สิงหาคม': '08',
            'กันยายน': '09', 'ตุลาคม': '10', 'พฤศจิกายน': '11', 'ธันวาคม': '12'
        };
        const date = `${year}-${thaiMonths[month]}-${day.padStart(2, '0')}`;
        document.getElementById('editDate').value = date;

        // หา daily_id ของ card นี้
        const dailyId = card.querySelector('.edit-btn').getAttribute('data-daily-id');
        const mealsData = window.lastDailyMealsData && window.lastDailyMealsData[dailyId] ? window.lastDailyMealsData[dailyId] : null;

        // Populate meal sections
        ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
            const mealSection = card.querySelector(`.meal-section.${mealType}`);
            editMeals[mealType] = [];
            let iconUrl = null;
            if (mealSection) {
                const mealItems = mealSection.querySelectorAll('.meal-list-item');
                mealItems.forEach((item, idx) => {
                    const name = item.querySelector('.meal-name')?.textContent?.trim() || '';
                    const caloriesText = item.querySelector('.menu-calories')?.textContent || '';
                    const caloriesMatch = caloriesText.match(/\((\d+)\s*(kcal)?\)/i);
                    const calories = caloriesMatch ? caloriesMatch[1] : '0';
                    const menuId = item.getAttribute('data-menu-id');
                    // ดึง icon_url จาก mealsData ถ้ามี
                    if (mealsData && mealsData[mealType] && mealsData[mealType][idx]) {
                        iconUrl = mealsData[mealType][idx].icon_url;
                    }
                    if (name && name !== 'เมนูยังไม่ถูกเลือก' && menuId) {
                        editMeals[mealType].push({ 
                            mymenu_id: parseInt(menuId),
                            name: name,
                            calories: calories,
                            icon_url: iconUrl
                        });
                    }
                });
            }
            // set icon_url สำหรับ icon-selector
            if (iconUrl) editMeals[mealType].icon_url = iconUrl;
            renderMealList(mealType);
        });
        updateTotalCaloriesEdit();
        initializeIconSelectors();
    }

    // Save edit changes
    const saveEditBtn = document.getElementById('saveEdit');
    if (saveEditBtn) {
        saveEditBtn.onclick = () => {
            const date = document.getElementById('editDate').value;
            const meals = { breakfast: [], lunch: [], dinner: [] };
            ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
                document.querySelectorAll(`.meal-section-edit.${mealType} .meal-list-item`).forEach((item, idx) => {
                    const menuId = item.dataset.menuId;
                    if (menuId) meals[mealType].push({
                        mymenu_id: parseInt(menuId),
                        icon_url: (
                            editMeals[mealType][idx]?.icon_url ||
                            editMeals[mealType].icon_url ||
                            mealIcons[mealType][0]
                        )
                    });
                });
            });
            const dailyData = { date, meals };
            
            if (isEdit && currentDailyMealCard) {
                const dailyId = currentDailyMealCard.querySelector('.edit-btn').getAttribute('data-daily-id');
                // Update existing daily meal
                fetch(`/daily-meals/${dailyId}`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(dailyData)
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        fetchDailyMeals();
                        document.getElementById('editDailyMealModal').style.display = 'none';
                        showSuccessDailyMealModal('แก้ไขมื้ออาหารสำเร็จ');
                    } else {
                        alert(data.error || 'เกิดข้อผิดพลาดขณะแก้ไขมื้ออาหาร');
                    }
                });
            } else {
                // Create new daily meal
                saveDailyMeal(dailyData, () => {
                    document.getElementById('editDailyMealModal').style.display = 'none';
                });
            }
        };
    }

    // Setup add meal buttons on page load
    setupAddMealBtns();

    // Show menu selection modal
    function showMenuSelection() {
        elements.editDailyMealModal.style.display = 'none';
        elements.selectMenuModal.style.display = 'flex';
        // Populate menu list
        const menuList = elements.selectMenuModal.querySelector('.menu-list');
        menuList.innerHTML = '';
        // Get all menu cards from My Menu
        const menuCards = document.querySelectorAll('.menu-card');
        if (menuCards.length === 0) {
            // ถ้าไม่มีเมนูเลย ให้แสดงข้อความ
            const emptyMsg = document.createElement('div');
            emptyMsg.style.textAlign = 'center';
            emptyMsg.style.color = '#888';
            emptyMsg.style.fontSize = '1.1rem';
            emptyMsg.style.margin = '32px 0';
            emptyMsg.textContent = 'ขณะนี้ไม่มีเมนูอาหารที่บันทึกไว้';
            menuList.appendChild(emptyMsg);
            return;
        }
        menuCards.forEach(card => {
            const menuId = card.getAttribute('data-menu-id');
            const menuName = card.querySelector('.menu-name')?.textContent || '';
            const calorieValue = card.querySelector('.calorie-value')?.textContent || '';
            if (!menuName || !calorieValue) return;
            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item';
            menuItem.innerHTML = `
                <div class="menu-info">
                    <span class="menu-name">${menuName}</span>
                </div>
                <div class="calorie-info">
                    <span class="calorie-value">${calorieValue}</span>
                    <span class="calorie-unit">kcal</span>
                </div>
            `;
            menuItem.addEventListener('click', () => {
                document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('selected'));
                menuItem.classList.add('selected');
                selectedMenu = {
                    mymenu_id: menuId,
                    name: menuName,
                    calories: calorieValue
                };
            });
            menuList.appendChild(menuItem);
        });
    }

    // Reset selection
    function resetSelection() {
        selectedMealType = null;
        selectedMenu = null;
        currentDailyMealCard = null;
    }

    // Cancel edit
    elements.cancelEditBtn.addEventListener('click', () => {
        elements.editDailyMealModal.style.display = 'none';
        resetSelection();
    });

    // Cancel menu selection
    elements.cancelMenuBtn.addEventListener('click', () => {
        elements.selectMenuModal.style.display = 'none';
        elements.editDailyMealModal.style.display = 'flex';
    });

    // Add Daily Meal button functionality
    const addDailyMealBtn = document.querySelector('.add-daily-meal-btn');
    if (addDailyMealBtn) {
        addDailyMealBtn.addEventListener('click', () => {
            // รีเซต state
            editMeals = { breakfast: [], lunch: [], dinner: [] };
            currentDailyMealCard = null;
            isEdit = false;

            // รีเซตวันที่เป็นวันนี้
            document.getElementById('editDate').value = new Date().toISOString().split('T')[0];

            // รีเซตไอคอนของแต่ละมื้อเป็น default
            ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
                editMeals[mealType].icon_url = mealIcons[mealType][0];
                renderMealList(mealType);
            });

            // รีเซตค่าแคลอรี่
            updateTotalCaloriesEdit();

            // รีเซตไอคอนใน DOM
            initializeIconSelectors();

            // รีเซตหัวข้อ
            document.querySelector('#editDailyMealModal .modal-header h2').textContent = 'เพิ่มมื้ออาหารของฉัน';

            // แสดง modal
            document.getElementById('editDailyMealModal').style.display = 'flex';
        });
    }

    // Initialize icon selectors when the page loads
    initializeIconSelectors();

    // Add event listeners for icon selection
    document.addEventListener('click', function(e) {
        if (e.target.closest('.icon-options img')) {
            const selectedIcon = e.target;
            const iconSelector = selectedIcon.closest('.icon-selector');
            const mainIcon = iconSelector.querySelector('.meal-icon');
            mainIcon.src = selectedIcon.src;
        }
    });

    // Initialize page
    function initializePage() {
        // ค้นหา header ของ "เมนูอาหารของฉัน"
        const myMenuHeader = Array.from(elements.menuHeaders).find(header => 
            header.querySelector('span').textContent === 'เมนูอาหารของฉัน'
        );
        if (myMenuHeader) {
            // เพิ่ม class active ให้กับ header
            myMenuHeader.classList.add('active');
            // เรียกใช้ฟังก์ชัน updateDisplayedMenuType เพื่อแสดงเนื้อหาของ "เมนูอาหารของฉัน"
            updateDisplayedMenuType('เมนูอาหารของฉัน');
            // เรียกใช้ฟังก์ชัน updateButtons เพื่ออัพเดทปุ่มกรอง
            updateButtons('เมนูอาหารของฉัน');
            // เรียกใช้ฟังก์ชัน sortMenuCards เพื่อเรียงการ์ด
            sortMenuCards();
            // เรียกใช้ฟังก์ชัน showOrHideSearchBar เพื่อแสดง/ซ่อนช่องค้นหา
            showOrHideSearchBar();
            // เรียกใช้ฟังก์ชัน showOrHideNoMyMenuMessage เพื่อแสดง/ซ่อนข้อความเมื่อไม่มีเมนู
            showOrHideNoMyMenuMessage();
        }
    }

    // เรียกใช้ initializePage ทันทีหลังจาก DOM โหลดเสร็จ
    initializePage();

    function showOrHideNoDailyMealMessage() {
        const dailyMealContent = document.querySelector('.daily-meal-content');
        const noMsg = dailyMealContent.querySelector('.no-daily-meal-message');
        const hasCard = dailyMealContent.querySelector('.daily-meal-card');
        if (noMsg) {
            noMsg.style.display = hasCard ? 'none' : 'block';
        }
    }

    function showOrHideNoMyMenuMessage() {
        const menuContainer = document.querySelector('.menu-container');
        const noMsg = menuContainer.querySelector('.no-my-menu-message');
        const hasCard = menuContainer.querySelector('.menu-card');
        if (noMsg) {
            noMsg.style.display = hasCard ? 'none' : 'block';
        }
    }

    // เรียกใช้หลังเพิ่ม/ลบ/เรียง .menu-card ทุกครั้ง เช่นในฟังก์ชัน sortMenuCards, หลังลบ/เพิ่มเมนู
    const menuGrid = document.querySelector('.menu-grid');
    if (menuGrid) {
        const observer = new MutationObserver(function() {
            showOrHideNoMyMenuMessage();
            showOrHideSearchBar();
        });
        observer.observe(menuGrid, { childList: true, subtree: false });
        // เรียกครั้งแรกหลังโหลดหน้า
        showOrHideNoMyMenuMessage();
        showOrHideSearchBar();
    }

    // --- Popup รายละเอียดเมนู My Menu ---
    // ตัวอย่าง mock ข้อมูลวัตถุดิบ (ควรดึงจากฐานข้อมูลจริง)
    const menuData = {
        "ข้าวผัดกุ้ง": {
            ingredients: [
                { name: "ข้าวสวย", calories: 200 },
                { name: "กุ้ง", calories: 120 },
                { name: "น้ำมัน", calories: 50 },
                { name: "ไข่", calories: 80 }
            ]
        },
        "ข้าวไข่กุ้ง": {
            ingredients: [
                { name: "ข้าวสวย", calories: 200 },
                { name: "ไข่", calories: 80 },
                { name: "กุ้ง", calories: 120 },
                { name: "น้ำมัน", calories: 50 }
            ]
        }
        // เพิ่มเมนูอื่นๆ ตามต้องการ
    };

    function setupViewDetailsButtons() {
        document.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.onclick = function() {
                const card = btn.closest('.menu-card');
                const menuId = btn.getAttribute('data-menu-id');
                const menuName = card.querySelector('.menu-name').textContent.trim();
                const menuDate = card.querySelector('.menu-date')?.textContent.replace('Created:', '').trim() || card.getAttribute('data-created') || '';
                
                // ดึงข้อมูล ingredients จาก API
                fetch(`/get-menu-ingredients/${menuId}`)
                    .then(response => response.json())
                    .then(data => {
                        const modal = document.getElementById('menuDetailModal');
                        const nameElem = modal.querySelector('.detail-menu-name');
                        const dateElem = modal.querySelector('.detail-menu-date');
                        const ingElem = modal.querySelector('.detail-ingredients');
                        const totalElem = modal.querySelector('.detail-total-calories');
                        
                        nameElem.textContent = menuName;
                        dateElem.textContent = menuDate ? `สร้างเมื่อ: ${menuDate}` : '';
                        
                        if (data.ingredients && data.ingredients.length > 0) {
                            let total = 0;
                            ingElem.innerHTML = data.ingredients.map(ing => {
                                total += parseFloat(ing.calories || 0);
                                return `
                                    <div class="detail-ingredient-row">
                                        <span class="ingredient-name">${ing.name}</span>
                                        <span class="ingredient-quantity">x${ing.quantity}</span>
                                        <span class="ingredient-calories">${ing.base_calories} kcal</span>
                                    </div>
                                `;
                            }).join('');
                            totalElem.textContent = `แคลอรี่รวม: ${total} kcal`;
                        } else {
                            ingElem.innerHTML = '<div class="no-ingredients">ไม่มีข้อมูลวัตถุดิบ</div>';
                            totalElem.textContent = '';
                        }
                        
                        modal.style.display = 'flex';
                    })
                    .catch(error => {
                        console.error('Error fetching ingredients:', error);
                        const modal = document.getElementById('menuDetailModal');
                        const ingElem = modal.querySelector('.detail-ingredients');
                        ingElem.innerHTML = '<div class="error-message">เกิดข้อผิดพลาดในการดึงข้อมูลวัตถุดิบ</div>';
                    });
            };
        });
    }

    // ปุ่มปิด popup
    const closeDetailBtn = document.querySelector('.close-detail-modal');
    if (closeDetailBtn) {
        closeDetailBtn.onclick = function() {
            document.getElementById('menuDetailModal').style.display = 'none';
        };
    }
    // ปิดเมื่อคลิกนอก modal
    const menuDetailModal = document.getElementById('menuDetailModal');
    if (menuDetailModal) {
        menuDetailModal.onclick = function(e) {
            if (e.target === this) this.style.display = 'none';
        };
    }

    // เรียก setupViewDetailsButtons() หลังโหลดหน้าและหลังเพิ่ม/ลบเมนู
    setupViewDetailsButtons();

    // Add search input event listeners
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        // Remove previous event listener
        searchInput.removeEventListener('input', showOrHideSearchBar);
        
        // Add new event listeners
        searchInput.addEventListener('input', function() {
            if (document.querySelector('.right-content.my-menu-active')) {
                showOrHideSearchBar();
            } else if (document.querySelector('.right-content.daily-meal-active')) {
                showOrHideDailyMealSearchBar();
            }
        });
    }

    // === Success Modal for Daily Meal ===
    function showSuccessDailyMealModal(msg) {
        const modal = document.getElementById('successDailyMealModal');
        const text = document.getElementById('successDailyMealText');
        const modalContent = modal.querySelector('.success-modal');
        text.textContent = msg;
        modal.style.display = 'flex';
        modalContent.classList.remove('hide');
    }
    document.getElementById('closeSuccessDailyMeal').onclick = function() {
        const modal = document.getElementById('successDailyMealModal');
        const modalContent = modal.querySelector('.success-modal');
        modalContent.classList.add('hide');
        setTimeout(() => {
            modal.style.display = 'none';
            modalContent.classList.remove('hide');
        }, 350); // match fadeOutDown duration
    };

    // --- Daily Meal CRUD ---
    function fetchDailyMeals() {
        fetch('/daily-meals')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // เก็บข้อมูล raw ไว้สำหรับใช้ใน populateEditModal
                    window.lastDailyMealsData = {};
                    data.dailies.forEach(daily => {
                        window.lastDailyMealsData[daily.daily_id] = daily.meals;
                    });
                    renderDailyMeals(data.dailies);
                }
            });
    }

    function renderDailyMeals(dailies) {
        const dailyMealContent = document.querySelector('.daily-meal-content');
        dailyMealContent.innerHTML = '';
        if (!dailies.length) {
            dailyMealContent.innerHTML = '<div class="no-daily-meal-message">ขณะนี้ยังไม่มีรายการมื้ออาหาร</div>';
            return;
        }
        dailies.forEach(daily => {
            const card = document.createElement('div');
            card.className = 'daily-meal-card';
            card.innerHTML = `
                <div class="daily-meal-header">
                    <div class="date-info">
                        <span class="date">${formatThaiDate(daily.date)}</span>
                    </div>
                    <div class="action-buttons">
                        <button class="edit-btn" data-daily-id="${daily.daily_id}">Edit</button>
                        <button class="delete-btn" data-daily-id="${daily.daily_id}">Delete</button>
                    </div>
                </div>
                ${['breakfast','lunch','dinner'].map(mealType => renderMealSection(mealType, daily.meals[mealType])).join('')}
                <div class="total-calories">แคลอรี่ทั้งหมด: <span class="total-calorie-value">${sumTotalCalories(daily.meals)}</span> <span class="calorie-unit">kcal</span></div>
            `;
            dailyMealContent.appendChild(card);
        });
        setupDailyMealEditDeleteBtns();
    }

    function renderMealSection(mealType, meals) {
        const mealTypeLabel = mealType === 'breakfast' ? 'มื้อเช้า' : mealType === 'lunch' ? 'มื้อกลางวัน' : 'มื้อเย็น';
        // Use default empty meal icon if no meals, otherwise use first meal's icon or default
        const iconUrl = meals.length > 0 ? 
            (meals[0].icon_url || mealIcons[mealType][1]) : 
            mealIcons[mealType][0]; // Use the new empty meal icon as default

        let mealListHtml = '';
        if (meals.length > 0) {
            mealListHtml = meals.map(m => `
                <div class="meal-list-item web-view" data-menu-id="${m.mymenu_id}">
                    <span class="meal-name">${m.name}</span>
                    <span class="menu-calories">(${m.calories} kcal)</span>
                </div>
            `).join('');
        } else {
            mealListHtml = `<div class="meal-list-item web-view"><span class="meal-name">เมนูยังไม่ถูกเลือก</span></div>`;
        }
        const totalMealCalories = meals.reduce((sum, m) => sum + parseFloat(m.calories), 0);

        return `
            <div class="meal-section ${mealType}">
                <div class="meal-info web-view" style="align-items:flex-start;">
                    <div class="meal-image">
                        <img src="${iconUrl}" alt="${mealTypeLabel}">
                    </div>
                    <div class="meal-details" style="flex:1;">
                        <span class="meal-type meal-type-title">${mealTypeLabel}</span>
                        <div class="meal-list">${mealListHtml}</div>
                    </div>
                    <div class="meal-calories meal-total-calories-inline">
                        <span class="calorie-value">${totalMealCalories}</span>
                        <span class="calorie-unit">kcal</span>
                    </div>
                </div>
            </div>
        `;
    }

    function sumTotalCalories(meals) {
        return ['breakfast','lunch','dinner'].reduce((sum, type) => sum + meals[type].reduce((s, m) => s + parseInt(m.calories), 0), 0);
    }

    function formatThaiDate(dateStr) {
        const d = new Date(dateStr);
        const months = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
        return `วันที่ ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }

    function setupDailyMealEditDeleteBtns() {
        document.querySelectorAll('.daily-meal-card .edit-btn').forEach(btn => {
            btn.onclick = function() {
                const dailyId = btn.getAttribute('data-daily-id');
                const card = btn.closest('.daily-meal-card');
                currentDailyMealCard = card;
                isEdit = true;
                populateEditModal(card);
                document.querySelector('#editDailyMealModal .modal-header h2').textContent = 'แก้ไขมื้ออาหาร';
                document.getElementById('editDailyMealModal').style.display = 'flex';
            };
        });
        document.querySelectorAll('.daily-meal-card .delete-btn').forEach(btn => {
            btn.onclick = function() {
                const dailyId = btn.getAttribute('data-daily-id');
                // Popup แทน confirm
                const confirmModal = document.getElementById('deleteDailyMealConfirmModal');
                confirmModal.style.display = 'flex';
                document.getElementById('confirmDeleteDailyMeal').onclick = function() {
                    fetch(`/daily-meals/${dailyId}`, {method: 'DELETE'})
                        .then(res => res.json())
                        .then(data => {
                            confirmModal.style.display = 'none';
                            if (data.success) {
                                fetchDailyMeals();
                                showSuccessDailyMealModal('ลบมื้ออาหารสำเร็จ');
                            } else {
                                alert(data.error || 'เกิดข้อผิดพลาดขณะลบมื้ออาหาร');
                            }
                        });
                };
                document.getElementById('cancelDeleteDailyMeal').onclick = function() {
                    confirmModal.style.display = 'none';
                };
            };
        });
    }

    // เรียก fetchDailyMeals() หลังโหลดหน้า
    fetchDailyMeals();

    function saveDailyMeal(dailyData, onSuccess) {
        fetch('/daily-meals', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(dailyData)
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                fetchDailyMeals();
                showSuccessDailyMealModal('บันทึกมื้ออาหารสำเร็จ');
                if (onSuccess) onSuccess();
            } else {
                alert(data.error || 'เกิดข้อผิดพลาดขณะบันทึกมื้ออาหาร');
            }
        });
    }

    // Function to update BMI display
    function updateBMIDisplay() {
        const bmiValue = document.querySelector('.bmi-value .value');
        const bmiStatus = document.querySelector('.bmi-status .status');
        const rangeBar = document.querySelector('.range-bar');
        
        // Remove all active classes from range bar
        rangeBar.querySelectorAll('.range').forEach(range => {
            range.classList.remove('active');
        });
        
        // Get current BMI value
        const currentBMI = parseFloat(bmiValue.textContent);
        
        if (!isNaN(currentBMI)) {
            // Add active class to appropriate range
            if (currentBMI < 18.5) {
                rangeBar.querySelector('.underweight').classList.add('active');
            } else if (currentBMI < 25) {
                rangeBar.querySelector('.normal').classList.add('active');
            } else if (currentBMI < 30) {
                rangeBar.querySelector('.overweight').classList.add('active');
            } else {
                rangeBar.querySelector('.obese').classList.add('active');
            }
        }
    }

    // Call updateBMIDisplay when the page loads
    document.addEventListener('DOMContentLoaded', function() {
        updateBMIDisplay();
    });

    // Sidebar toggle functionality
    elements.sidebarToggle.addEventListener('click', () => {
        elements.leftContent.classList.toggle('collapsed');
        elements.rightContent.classList.toggle('expanded');
        elements.fixedHeader.classList.toggle('expanded');
        elements.sidebarToggle.classList.toggle('collapsed');
        elements.sidebarToggle.textContent = elements.sidebarToggle.classList.contains('collapsed') ? '▶' : '◀';
    });

    // เปลี่ยนจากการใช้ window.currentUserId เป็นการดึงค่า user_id จาก HTML element
    function getCurrentUserId() {
        // ดึงค่า user_id จาก hidden input ที่เราจะเพิ่มใน HTML
        return document.getElementById('current-user-id').value;
    }

    // แก้ไขส่วนที่ใช้ userId
    function setUserMultiplierCookie(multiplier) {
        const userId = getCurrentUserId();
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);
        document.cookie = `activityMultiplier_${userId}=${multiplier};expires=${expirationDate.toUTCString()};path=/`;
    }

    function getUserMultiplierCookie() {
        const userId = getCurrentUserId();
        const name = `activityMultiplier_${userId}=`;
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i].trim();
            if (c.indexOf(name) === 0) {
                return parseFloat(c.substring(name.length, c.length));
            }
        }
        return null;
    }

    const activityButtons = document.querySelectorAll('.activity-btn');
    activityButtons.forEach(button => {
        button.addEventListener('click', () => {
            activityButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const multiplier = parseFloat(button.dataset.multiplier);
            updateTDEE(multiplier);
            setUserMultiplierCookie(multiplier);
            // Debug
            console.log('Saved multiplier:', multiplier);
        });
    });

    // --- Initialize TDEE calculation when the page loads ---
    let multiplier = getUserMultiplierCookie();
    if (!multiplier) {
        multiplier = 1.2; // default
        setUserMultiplierCookie(multiplier);
        // disable ปุ่มอื่นชั่วคราว
        document.querySelectorAll('.activity-btn').forEach(btn => {
            if (btn.dataset.multiplier !== '1.2') {
                btn.disabled = true;
                btn.style.opacity = 0.5;
            }
        });
    }

    // เพิ่ม event listener สำหรับทุกปุ่ม activity
    document.querySelectorAll('.activity-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Enable ทุกปุ่มเมื่อกดปุ่มใดก็ได้
            document.querySelectorAll('.activity-btn').forEach(b => {
                b.disabled = false;
                b.style.opacity = 1;
            });
        });
    });

    const btn = document.querySelector(`.activity-btn[data-multiplier="${multiplier}"]`);
    if (btn) {
        btn.classList.add('active');
        updateTDEE(multiplier);
    }
    // Debug
    console.log('Loaded multiplier:', multiplier);

    // Update TDEE calculation
    function updateTDEE(multiplier) {
        const userWeight = parseFloat(document.querySelector('.user-weight')?.textContent || '0');
        const userHeight = parseFloat(document.querySelector('.user-height')?.textContent || '0');
        const userBirthday = document.querySelector('.user-birthday')?.textContent || '';
        const userGender = document.querySelector('.user-gender')?.textContent || '';

        console.log('DEBUG:', { userWeight, userHeight, userBirthday, userGender });

        const minCaloriesElement = document.querySelector('.range-item:first-child .value');
        const maxCaloriesElement = document.querySelector('.range-item:last-child .value');

        let age = 0;
        if (userBirthday) {
            const birthDate = new Date(userBirthday);
            if (!isNaN(birthDate.getTime())) {
                const today = new Date();
                age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
            } else {
                console.log('วันเกิด format ผิด:', userBirthday);
            }
        }

        let bmr = 0;
        if (userGender === 'ชาย'|| userGender === 'Male'|| userGender === 'male') {
            bmr = 66 + (13.7 * userWeight) + (5 * userHeight) - (6.8 * age);
        } else if (userGender === 'หญิง' || userGender === 'Female' || userGender === 'female') {
            bmr = 665 + (9.6 * userWeight) + (1.8 * userHeight) - (4.7 * age);
        }

        const tdee = Math.round(bmr * multiplier);
        const minCalories = Math.round(bmr);
        const maxCalories = Math.round(tdee);

        if (minCaloriesElement) minCaloriesElement.textContent = minCalories.toLocaleString();
        if (maxCaloriesElement) maxCaloriesElement.textContent = maxCalories.toLocaleString();

        console.log('BMR:', bmr, 'TDEE:', tdee, 'age:', age);
    }

    // Daily Meal Edit functionality
    function setupEditButtons() {
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.onclick = () => {
                currentDailyMealCard = button.closest('.daily-meal-card');
                isEdit = true;
                populateEditModal(currentDailyMealCard);
                document.querySelector('#editDailyMealModal .modal-header h2').textContent = 'แก้ไขมื้ออาหาร';
                document.getElementById('editDailyMealModal').style.display = 'flex';
            };
        });
    }

    // Handle meal deletion (delete icon in edit modal)
    document.querySelectorAll('.meal-section-edit .delete-meal-btn').forEach(button => {
        button.addEventListener('click', () => {
            const mealSection = button.closest('.meal-section-edit');
            mealSection.querySelector('.meal-name').textContent = 'เมนูยังไม่ถูกเลือก';
            mealSection.querySelector('.meal-calories').textContent = '0 kcal';
            mealSection.classList.add('empty');
            // Show select-new-meal-btn, hide delete-meal-btn
            mealSection.querySelector('.select-new-meal-btn').style.display = 'flex';
            button.style.display = 'none';
            updateTotalCaloriesEdit();
        });
    });

    // Handle icon selection
    document.querySelectorAll('.icon-options img').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            const iconSelector = icon.closest('.icon-selector');
            const mainIcon = iconSelector.querySelector('.meal-icon');
            mainIcon.src = icon.src;
            mainIcon.dataset.icon = icon.dataset.icon;
        });
    });

    // Handle menu selection
    document.querySelectorAll('.select-new-meal-btn').forEach(button => {
        button.addEventListener('click', () => {
            const mealSection = button.closest('.meal-section-edit');
            selectedMealType = mealSection.classList[1]; // breakfast, lunch, or dinner
            showMenuSelection();
        });
    });

    // Close success modal
    elements.closeSuccessBtn.addEventListener('click', () => {
        elements.deleteSuccessModal.style.display = 'none';
    });
});