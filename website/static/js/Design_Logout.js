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
    const resetButton = document.querySelector('.reset-button');
    const resetConfirmModal = document.getElementById('resetConfirmModal');
    const confirmResetBtn = document.getElementById('confirmReset');
    const cancelResetBtn = document.getElementById('cancelReset');

    // Function to update total calories
    function updateTotalCalories() {
        let totalCalories = 0;
        const ingredientItems = document.querySelectorAll('.ingredient-items .ingredient-item');
        
        ingredientItems.forEach(item => {
            const calorieText = item.querySelector('.calorie-container span').textContent;
            const quantity = parseFloat(item.querySelector('.quantity-input').value) || 0;
            const baseCalories = parseFloat(calorieText.replace(' kcal', ''));
            const itemCalories = Math.round(baseCalories * quantity); // แก้สูตรให้ถูกต้อง ไม่ต้องหารด้วย 100
            totalCalories += itemCalories;
        });

        sumCalorieElement.textContent = `ผลรวม: ${Math.round(totalCalories)} kcal`;
    }

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

    // Add event listener for search input
    if (searchInput) {
        searchInput.addEventListener('keyup', searchIngredients);
    }

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
            if (typeof updateTotalCalories === 'function') {
                updateTotalCalories();
            }

            // Close the confirmation modal
            resetConfirmModal.style.display = 'none';

            // Scroll to top after reset
            if (typeof scrollToTop === 'function') {
                scrollToTop();
            }
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
                                                <span>${ing.calories} </span>
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

    // --- เพิ่มเติม: ดึงข้อมูลจาก sessionStorage ถ้ามี ---
    const editMenuData = sessionStorage.getItem('editMenuData');
    if (editMenuData) {
        try {
            const { menuName, ingredients } = JSON.parse(editMenuData);
            // วนลูป ingredients แล้วเติมลง .ingredient-items
            if (ingredients && Array.isArray(ingredients)) {
                ingredients.forEach(ingredient => {
                    // หา ingredient box ที่ตรงกับชื่อวัตถุดิบ
                    const box = Array.from(document.querySelectorAll('.sum-ingredients .box')).find(b => {
                        return b.querySelector('h1') && b.querySelector('h1').textContent.trim() === ingredient.name.trim();
                    });
                    if (box) {
                        // หา category header
                        const mainCategory = box.getAttribute('data-main-category');
                        const targetHeader = Array.from(document.querySelectorAll('.category-header')).find(header => {
                            const categorySpan = header.querySelector('span:last-child');
                            return categorySpan && categorySpan.textContent === mainCategory;
                        });
                        if (targetHeader) {
                            const categoryContainer = targetHeader.closest('.ingredient-category');
                            let itemsContainer = categoryContainer.querySelector('.ingredient-items');
                            if (!itemsContainer) {
                                itemsContainer = document.createElement('div');
                                itemsContainer.className = 'ingredient-items';
                                categoryContainer.appendChild(itemsContainer);
                            }
                            // สร้าง element ingredient-item
                            const imgElement = box.querySelector('img');
                            const caloriesText = box.querySelector('p:last-of-type').textContent;
                            const calories = parseFloat(caloriesText.split(':')[1]);
                            const newItem = document.createElement('div');
                            newItem.className = 'ingredient-item';
                            newItem.innerHTML = `
                                <img src="${imgElement.src}" class="food-img">
                                <div class="ingredient-info">
                                    <div class="name-calorie-container">
                                        <span>${ingredient.name}</span>
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
                    }
                });
                // อัปเดตแคลอรี่รวม
                if (typeof updateTotalCalories === 'function') updateTotalCalories();
            }
        } catch (e) {
            console.error('Error parsing editMenuData:', e);
        }
        // ลบ sessionStorage ทิ้ง
        sessionStorage.removeItem('editMenuData');
    }
});






