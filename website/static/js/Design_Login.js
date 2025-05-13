console.log('Design_Login.js loaded');

document.addEventListener("DOMContentLoaded", function () {
    const toggleButtons = document.querySelectorAll(".toggle-btn");
    const deleteButtons = document.querySelectorAll(".delete-btn");
    const categoryHeaders = document.querySelectorAll(".category-header");
    const typeHeading = document.querySelector(".type h1");
    const buttonsContainer = document.querySelector(".buttons-container");
    const addButtons = document.querySelectorAll(".sum-ingredients .box button");
    const ingredientBoxes = document.querySelectorAll(".sum-ingredients .box");
    const sumCalorieElement = document.querySelector(".sum_calorie p");
    const searchInput = document.getElementById('ingredientSearch');

    // Function to handle ingredient search
    function searchIngredients() {
        const searchTerm = searchInput.value.toLowerCase();
        const activeCategory = document.querySelector('.category-header.active');
        const currentCategory = activeCategory ? activeCategory.querySelector('span:last-child').textContent : '';
        
        ingredientBoxes.forEach(box => {
            const boxCategory = box.getAttribute('data-main-category');
            const ingredientName = box.querySelector('h1').textContent.toLowerCase();
            
            if (boxCategory === currentCategory) {
                if (ingredientName.includes(searchTerm)) {
                    box.style.display = 'block';
                } else {
                    box.style.display = 'none';
                }
            }
        });
    }

    // Add event listener for search input
    if (searchInput) {
        searchInput.addEventListener('keyup', searchIngredients);
    }

    // Function to update total calories
    function updateTotalCalories() {
        let totalCalories = 0;
        const ingredientItems = document.querySelectorAll('.ingredient-items .ingredient-item');
        
        ingredientItems.forEach(item => {
            const calorieText = item.querySelector('.calorie-container span').textContent;
            const quantity = parseFloat(item.querySelector('.quantity-input').value) || 0;
            const baseCalories = parseFloat(calorieText.replace(' kcal', ''));
            const itemCalories = Math.round(baseCalories * quantity); // คำนวณแคลอรี่ตามจำนวน
            totalCalories += itemCalories;
        });

        sumCalorieElement.textContent = `ผลรวม: ${Math.round(totalCalories)} kcal`;
    }

    // Initialize all sections as closed
    document.querySelectorAll(".ingredient-items").forEach(items => {
        items.style.display = "none";
    });

    // Function to show ingredients for a specific category
    function showCategoryIngredients(category) {
        ingredientBoxes.forEach(box => {
            const boxCategory = box.getAttribute('data-main-category');
            if (boxCategory === category) {
                box.style.display = 'block';
            } else {
                box.style.display = 'none';
            }
        });
    }

    // Function to reset all buttons to inactive state
    function resetButtons() {
        buttonsContainer.querySelectorAll('.button').forEach(button => {
            button.classList.remove('active');
        });
    }

    // Function to reset all category headers to inactive state
    function resetCategoryHeaders() {
        categoryHeaders.forEach(header => {
            header.classList.remove('active');
        });
    }

    // Function to scroll to top
    function scrollToTop() {
        const scrollableContent = document.querySelector('.scrollable-content');
        if (scrollableContent) {
            scrollableContent.scrollIntoView({ behavior: 'smooth' });
        }
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Handle category headers
    categoryHeaders.forEach(header => {
        header.addEventListener("click", function() {
            const categoryName = this.querySelector("span:last-child").textContent;
            if (typeHeading) {
                typeHeading.textContent = categoryName;
            }
            
            resetCategoryHeaders();
            this.classList.add('active');
            showCategoryIngredients(categoryName);
            scrollToTop();
        });
    });

    // Handle toggle buttons
    toggleButtons.forEach(button => {
        button.addEventListener("click", function (e) {
            e.stopPropagation();
            const parent = this.closest(".ingredient-category");
            let items = parent.querySelector(".ingredient-items");
            
            const isOpen = items.style.display !== "none";
            if (!isOpen) {
                items.style.display = "block";
                this.textContent = "▼";
            } else {
                items.style.display = "none";
                this.textContent = "▶";
            }
        });
    });

    // Handle Add button clicks
    addButtons.forEach(button => {
        button.addEventListener("click", function() {
            this.disabled = true;
            this.style.backgroundColor = '#cccccc';
            this.style.cursor = 'not-allowed';

            const box = this.closest(".box");
            if (!box) return;

            const imgElement = box.querySelector("img");
            const nameElement = box.querySelector("h1");
            const caloriesText = box.querySelector("p:last-of-type").textContent;
            const mainCategory = box.getAttribute('data-main-category');
            const calories = parseFloat(caloriesText.split(": ")[1].replace(" kcal", ""));

            if (!imgElement || !nameElement || !caloriesText || !mainCategory) return;

            const targetHeader = Array.from(categoryHeaders).find(header => {
                const categorySpan = header.querySelector("span:last-child");
                return categorySpan && categorySpan.textContent === mainCategory;
            });

            if (targetHeader) {
                const categoryContainer = targetHeader.closest('.ingredient-category');
                if (!categoryContainer) return;

                let itemsContainer = categoryContainer.querySelector('.ingredient-items');
                if (!itemsContainer) {
                    itemsContainer = document.createElement('div');
                    itemsContainer.className = 'ingredient-items';
                    categoryContainer.appendChild(itemsContainer);
                }

                let imgSrc = imgElement.getAttribute('src');
                let staticIndex = imgSrc.indexOf('/static/');
                let relativeImgPath = staticIndex !== -1 ? imgSrc.substring(staticIndex + 8) : imgSrc;

                const newItem = document.createElement('div');
                newItem.className = 'ingredient-item';
                newItem.setAttribute('data-ingredient-id', box.getAttribute('data-ingredient-id'));
                newItem.innerHTML = `
                    <img src="${imgSrc}" class="food-img">
                    <div class="ingredient-info">
                        <div class="name-calorie-container">
                            <span>${nameElement.textContent}</span>
                            <div class="calorie-container">
                                <span>${calories} kcal</span>
                            </div>  
                        </div>
                        <div class="quantity-delete-container">
                            <input type="number" class="quantity-input" value="1" min="1" step="1">
                            <button class="delete-btn">
                                <img src="/static/Image/delete.png">
                            </button>
                        </div>
                    </div>
                `;

                newItem.dataset.addButtonId = this.uniqueId || (this.uniqueId = 'add-btn-' + Math.random().toString(36).substr(2, 9));

                // Add event listener for quantity input
                const quantityInput = newItem.querySelector('.quantity-input');
                quantityInput.addEventListener('input', updateTotalCalories);

                const deleteBtn = newItem.querySelector('.delete-btn');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', () => {
                        newItem.remove();
                        const addButton = document.querySelector(`button[data-unique-id="${newItem.dataset.addButtonId}"]`);
                        if (addButton) {
                            addButton.disabled = false;
                            addButton.style.backgroundColor = '';
                            addButton.style.cursor = 'pointer';
                        }
                        updateTotalCalories();
                    });
                }

                itemsContainer.appendChild(newItem);
                itemsContainer.style.display = 'block';

                const toggleBtn = targetHeader.querySelector('.toggle-btn');
                if (toggleBtn) {
                    toggleBtn.textContent = '▼';
                }

                this.setAttribute('data-unique-id', newItem.dataset.addButtonId);
                updateTotalCalories();
            }
        });
    });

    // Initialize the page with the first category
    if (categoryHeaders.length > 0) {
        const firstCategory = categoryHeaders[0];
        const categoryName = firstCategory.querySelector("span:last-child").textContent;
        if (typeHeading) {
            typeHeading.textContent = categoryName;
        }
        firstCategory.classList.add('active');
        showCategoryIngredients(categoryName);
    }

    // Sidebar toggle functionality
    const toggleBtn = document.querySelector('.sidebar-toggle-btn');
    const leftContent = document.querySelector('.left-content');
    const rightContent = document.querySelector('.right-content');
    const fixedHeader = document.querySelector('.fixed-header');

    toggleBtn.addEventListener('click', function() {
        leftContent.classList.toggle('collapsed');
        rightContent.classList.toggle('expanded');
        fixedHeader.classList.toggle('expanded');
        toggleBtn.classList.toggle('collapsed');
        
        // Update button text based on state
        if (leftContent.classList.contains('collapsed')) {
            toggleBtn.textContent = '▶';
        } else {
            toggleBtn.textContent = '◀';
        }
    });

    // Reset button functionality with calorie update
    const resetButton = document.querySelector('.reset-button');
    const resetConfirmModal = document.getElementById('resetConfirmModal');
    const confirmResetBtn = document.getElementById('confirmReset');
    const cancelResetBtn = document.getElementById('cancelReset');

    if (resetButton && resetConfirmModal) {
        resetButton.addEventListener('click', function() {
            resetConfirmModal.style.display = 'flex';
        });

        confirmResetBtn.addEventListener('click', function() {
            // Find all ingredient-items containers and remove their children
            const ingredientContainers = document.querySelectorAll('.ingredient-items');
            ingredientContainers.forEach(container => {
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }
            });

            // Re-enable all add buttons
            const addButtons = document.querySelectorAll('.sum-ingredients .box button');
            addButtons.forEach(button => {
                button.disabled = false;
                button.style.backgroundColor = '';
                button.style.cursor = 'pointer';
            });

            // Update total calories after reset
            updateTotalCalories();

            // Close the confirmation modal
            resetConfirmModal.style.display = 'none';

            // Scroll to top after reset
            scrollToTop();
        });

        cancelResetBtn.addEventListener('click', function() {
            resetConfirmModal.style.display = 'none';
        });

        // Close reset confirmation modal when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === resetConfirmModal) {
                resetConfirmModal.style.display = 'none';
            }
        });
    }

    // Handle save button click with custom modal
    const saveButton = document.querySelector('.save-button');
    const saveModal = document.getElementById('saveModal');
    const successModal = document.getElementById('successModal');
    const confirmSave = document.getElementById('confirmSave');
    const cancelSave = document.getElementById('cancelSave');
    const foodNameInput = document.getElementById('foodName');
    const mealTypeSelect = document.getElementById('mealType');
    const datetimeInput = document.getElementById('datetime');

    // Set default datetime to now
    if (datetimeInput) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        datetimeInput.value = now.toISOString().slice(0, 16);
    }

    function showError(input, show = true) {
        const formGroup = input.closest('.form-group');
        if (show) {
            formGroup.classList.add('error');
        } else {
            formGroup.classList.remove('error');
        }
    }

    function validateForm() {
        let isValid = true;
        const errorMessages = [];

        // Validate food name
        if (!foodNameInput.value.trim()) {
            showError(foodNameInput, true);
            errorMessages.push('กรุณากรอกชื่ออาหาร');
            isValid = false;
        } else {
            showError(foodNameInput, false);
        }

        // Validate datetime
        if (!datetimeInput.value) {
            errorMessages.push('กรุณาระบุวันที่และเวลา');
            isValid = false;
        }

        // Validate ingredients
        const ingredientItems = document.querySelectorAll('.ingredient-items .ingredient-item');
        if (ingredientItems.length === 0) {
            errorMessages.push('กรุณาเลือกวัตถุดิบอย่างน้อย 1 รายการ');
            isValid = false;
        }

        if (!isValid) {
            alert(errorMessages.join('\n'));
        }

        return isValid;
    }

    function collectIngredientsData() {
        const ingredients = [];
        const ingredientItems = document.querySelectorAll('.ingredient-items .ingredient-item');
        ingredientItems.forEach(item => {
            const name = item.querySelector('.name-calorie-container span')?.textContent?.trim();
            const calorieText = item.querySelector('.calorie-container span')?.textContent || '';
            const caloriesPerUnit = parseFloat(calorieText.replace(' kcal', ''));
            const quantity = parseFloat(item.querySelector('.quantity-input')?.value) || 1;
            if (name && !isNaN(caloriesPerUnit) && !isNaN(quantity)) {
                ingredients.push({ name, quantity, calories: caloriesPerUnit * quantity });
            }
        });
        return ingredients;
    }

    function showSuccessModal() {
        saveModal.style.display = 'none';
        successModal.style.display = 'flex';
    }

    function resetForm() {
        if (typeof foodNameInput !== 'undefined' && foodNameInput) {
            foodNameInput.value = '';
            showError(foodNameInput, false);
        }
        if (typeof mealTypeSelect !== 'undefined' && mealTypeSelect) {
            mealTypeSelect.value = 'breakfast';
        }
        if (typeof datetimeInput !== 'undefined' && datetimeInput) {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            datetimeInput.value = now.toISOString().slice(0, 16);
        }
    }

    if (saveButton && saveModal && confirmSave && cancelSave) {
        saveButton.addEventListener('click', function() {
            saveModal.style.display = 'flex';
        });

        // Remove error when user starts typing
        foodNameInput.addEventListener('input', function() {
            showError(foodNameInput, false);
        });

        confirmSave.addEventListener('click', function() {
            if (validateForm()) {
                // Collect all ingredients data
                const ingredients = collectIngredientsData();
                
                // Get total calories
                const totalCalories = parseFloat(sumCalorieElement.textContent.replace('ผลรวม: ', '').replace(' kcal', ''));

                // Prepare data for saving
                const saveData = {
                    menu_name: foodNameInput.value.trim(),
                    datetime: datetimeInput.value,
                    total_calories: totalCalories,
                    ingredients: ingredients
                };

                // Show loading state
                confirmSave.disabled = true;
                confirmSave.textContent = 'กำลังบันทึก...';

                // Send data to server
                fetch('/save-menu', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(saveData)
                })
                .then(response => {
                    console.log('Raw response:', response);
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Response from /save-menu:', data);
                    if (data.success) {
                        showSuccessModal();
                        // Reset form and clear ingredients
                        resetForm();
                        document.querySelectorAll('.ingredient-items').forEach(container => {
                            container.innerHTML = '';
                        });
                        updateTotalCalories();
                    } else {
                        alert(data.error || 'เกิดข้อผิดพลาดในการบันทึกเมนู');
                    }
                })
                .catch(error => {
                    console.error('Error in fetch or parsing JSON:', error);
                })
                .finally(() => {
                    // Reset button state
                    confirmSave.disabled = false;
                    confirmSave.textContent = 'บันทึก';
                });
            }
        });

        cancelSave.addEventListener('click', function() {
            saveModal.style.display = 'none';
            resetForm();
        });

        // Close modals when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === saveModal) {
                saveModal.style.display = 'none';
                resetForm();
            } else if (event.target === successModal) {
                successModal.style.display = 'none';
                resetForm();
                window.location.reload(); // รีเฟรชหน้าเพื่อรีเซ็ตทุกอย่าง
            }
        });

        // Close success modal and reload page when clicking anywhere
        successModal.addEventListener('click', function() {
            successModal.style.display = 'none';
            resetForm();
            window.location.reload(); // รีเฟรชหน้าเพื่อรีเซ็ตทุกอย่าง
        });
    }

    // Initialize the page with carbohydrate ingredients and scroll functionality
    function initializePage() {
        if (typeHeading) {
            typeHeading.textContent = "คาร์โบไฮเดรต";
        }
        
        showCategoryIngredients("คาร์โบไฮเดรต");
        
        // Set up buttons with scroll functionality
        // updateButtons("คาร์โบไฮเดรต"); // <--- คอมเมนต์ออกเพื่อป้องกัน error

        const carbHeader = Array.from(categoryHeaders).find(header => 
            header.querySelector("span:last-child").textContent === "คาร์โบไฮเดรต"
        );
        if (carbHeader) {
            carbHeader.classList.add('active');
        }
    }

    // Initialize the page with carbohydrate ingredients
    initializePage();

    // --- Auto Menu Modal ---
    const autoMenuBtn = document.querySelector('.auto-menu-button');
    const autoMenuModal = document.getElementById('autoMenuModal');
    const autoMenuList = document.querySelector('.auto-menu-list');
    const closeAutoMenuModal = document.getElementById('closeAutoMenuModal');

    // --- Modal ยืนยันการจัดวัตถุดิบตามเมนูอัตโนมัติ ---
    const confirmAutoMenuModal = document.getElementById('confirmAutoMenuModal');
    const confirmAutoMenuTitle = document.getElementById('confirmAutoMenuTitle');
    const confirmAutoMenuBtn = document.getElementById('confirmAutoMenuBtn');
    const cancelAutoMenuBtn = document.getElementById('cancelAutoMenuBtn');
    let selectedAutoMenuId = null;
    let selectedAutoMenuName = '';

    if (autoMenuBtn && autoMenuModal && autoMenuList && closeAutoMenuModal) {
        autoMenuBtn.addEventListener('click', function() {
            fetch('/auto-menus')
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        autoMenuList.innerHTML = '';
                        data.menus.forEach(menu => {
                            const card = document.createElement('div');
                            card.className = 'auto-menu-card';
                            card.setAttribute('data-menu-id', menu.id);
                            card.innerHTML = `
                                <img src="/static/menu_images/${menu.image}" alt="${menu.name}">
                                <div>${menu.name}</div>
                            `;
                            // เพิ่ม event สำหรับเลือกเมนูอัตโนมัติ
                            card.addEventListener('click', function() {
                                selectedAutoMenuId = menu.id;
                                selectedAutoMenuName = menu.name;
                                confirmAutoMenuTitle.textContent = menu.name;
                                confirmAutoMenuModal.style.display = 'flex';
                            });
                            autoMenuList.appendChild(card);
                        });
                        autoMenuModal.style.display = 'flex';
                    }
                });
        });
        closeAutoMenuModal.addEventListener('click', function() {
            autoMenuModal.style.display = 'none';
        });
        // ปิด modal เมื่อคลิกนอก content
        autoMenuModal.addEventListener('click', function(e) {
            if (e.target === autoMenuModal) autoMenuModal.style.display = 'none';
        });
    }

    // --- Logic สำหรับ modal ยืนยันการจัดวัตถุดิบ ---
    if (confirmAutoMenuBtn && cancelAutoMenuBtn && confirmAutoMenuModal) {
        confirmAutoMenuBtn.addEventListener('click', function() {
            if (!selectedAutoMenuId) return;
            fetch(`/get-menuauto-ingredients/${selectedAutoMenuId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        // ลบวัตถุดิบเดิมทั้งหมด
                        document.querySelectorAll('.ingredient-items').forEach(c => c.innerHTML = '');
                        // รีเซ็ตปุ่ม +Add
                        document.querySelectorAll('.sum-ingredients .box button').forEach(button => {
                            button.disabled = false;
                            button.style.backgroundColor = '';
                            button.style.cursor = 'pointer';
                        });
                        // เติมวัตถุดิบใหม่
                        data.ingredients.forEach(ing => {
                            // หา category header ที่ตรงกับวัตถุดิบ
                            const targetHeader = Array.from(document.querySelectorAll('.category-header')).find(header => {
                                const categorySpan = header.querySelector('span:last-child');
                                return categorySpan && categorySpan.textContent === ing.category;
                            });
                            if (targetHeader) {
                                const categoryContainer = targetHeader.closest('.ingredient-category');
                                let itemsContainer = categoryContainer.querySelector('.ingredient-items');
                                if (!itemsContainer) return;
                                // สร้าง element ingredient-item
                                const newItem = document.createElement('div');
                                newItem.className = 'ingredient-item';
                                newItem.setAttribute('data-ingredient-id', ing.id);
                                newItem.innerHTML = `
                                    <img src="/static/ingredients/${ing.photo}" class="food-img">
                                    <div class="ingredient-info">
                                        <div class="name-calorie-container">
                                            <span>${ing.name}</span>
                                            <div class="calorie-container">
                                                <span>${ing.calories}</span>
                                            </div>
                                        </div>
                                        <div class="quantity-delete-container">
                                            <input type="number" class="quantity-input" value="1" min="1" step="1">
                                            <button class="delete-btn">
                                                <img src="/static/Image/delete.png">
                                            </button>
                                        </div>
                                    </div>
                                `;
                                // Event: quantity input
                                const quantityInput = newItem.querySelector('.quantity-input');
                                quantityInput.addEventListener('input', updateTotalCalories);
                                // Event: delete
                                const deleteBtn = newItem.querySelector('.delete-btn');
                                if (deleteBtn) {
                                    deleteBtn.addEventListener('click', () => {
                                        newItem.remove();
                                        updateTotalCalories();
                                    });
                                }
                                itemsContainer.appendChild(newItem);
                                itemsContainer.style.display = 'block';
                                // เปิด section
                                const toggleBtn = targetHeader.querySelector('.toggle-btn');
                                if (toggleBtn) toggleBtn.textContent = '▼';
                            }
                        });
                        updateTotalCalories();
                        // ตั้งชื่ออาหารใน input#foodName ตามชื่อเมนูอัตโนมัติ
                        if (foodNameInput && selectedAutoMenuName) {
                            foodNameInput.value = selectedAutoMenuName;
                        }
                        confirmAutoMenuModal.style.display = 'none';
                        autoMenuModal.style.display = 'none';
                    }
                });
        });
        cancelAutoMenuBtn.addEventListener('click', function() {
            confirmAutoMenuModal.style.display = 'none';
        });
        // ปิด modal เมื่อคลิกนอก content
        window.addEventListener('click', function(event) {
            if (event.target === confirmAutoMenuModal) {
                confirmAutoMenuModal.style.display = 'none';
            }
        });
    }

    // เติม ingredients จาก localStorage ถ้ามี predicted_ingredients
    const predictedIngredients = localStorage.getItem('predicted_ingredients');
    if (predictedIngredients) {
        try {
            const ingredients = JSON.parse(predictedIngredients);
            ingredients.forEach(ing => {
                // หา box ที่ตรงกับชื่อวัตถุดิบ
                const box = Array.from(document.querySelectorAll('.sum-ingredients .box')).find(b => b.querySelector('h1').textContent.trim() === ing.name);
                if (box) {
                    const addBtn = box.querySelector('button');
                    if (addBtn && !addBtn.disabled) {
                        addBtn.click();
                    }
                }
            });
        } catch (e) { /* ignore */ }
        localStorage.removeItem('predicted_ingredients');
    }
    // เติมชื่อเมนูจาก localStorage ถ้ามี predicted_menu_name
    const predictedMenuName = localStorage.getItem('predicted_menu_name');
    if (predictedMenuName) {
        const foodNameInput = document.getElementById('foodName');
        if (foodNameInput) foodNameInput.value = predictedMenuName;
        localStorage.removeItem('predicted_menu_name');
    }
});







