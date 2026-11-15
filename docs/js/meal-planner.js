/**
 * Meal planner controller.
 * Handles meal plan creation, editing, nutrition calculation, and printing.
 */

document.addEventListener('DOMContentLoaded', function() {
    const mealPlanForm = document.getElementById('meal-plan-form');
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const urlParams = new URLSearchParams(window.location.search);
    const mealPlanId = urlParams.get('id');

    const signinPrompt = document.getElementById('signin-prompt');
    const mealPlanSection = document.getElementById('meal-plan-section');
    const formError = document.getElementById('form-error');

    function showError(message) {
        if (formError) {
            formError.textContent = message;
            formError.style.display = 'block';
        }
    }

    function hideError() {
        if (formError) {
            formError.style.display = 'none';
        }
    }

    // Check if user is logged in
    if (!localStorage.getItem('userId')) {
        // Show inline sign-in prompt instead of blocking alert
        if (signinPrompt) signinPrompt.style.display = 'block';
        if (mealPlanSection) mealPlanSection.style.display = 'none';
        hideError();
        return;
    }

    // Show the meal plan form when authenticated
    if (signinPrompt) signinPrompt.style.display = 'none';
    if (mealPlanSection) mealPlanSection.style.display = 'block';
    hideError();

    // Load meal plan data if editing
    if (mealPlanId) {
        loadMealPlanData(mealPlanId);
    }

    // Add ingredient button functionality
    days.forEach(day => {
        const addButton = document.querySelector(`.add-ingredient[data-day="${day}"]`);
        const ingredientsList = document.getElementById(`${day}-ingredients-list`);

        if (addButton && ingredientsList) {
            addButton.addEventListener('click', () => {
                const newIngredient = document.createElement('div');
                newIngredient.className = 'ingredient-row';
                newIngredient.innerHTML = `
                    <input type="text" name="${day}[ingredients][]" placeholder="Enter ingredient" required>
                    <button type="button" class="btn btn-outline btn-sm remove-ingredient">Remove</button>
                `;
                ingredientsList.appendChild(newIngredient);

                const removeButton = newIngredient.querySelector('.remove-ingredient');
                removeButton.addEventListener('click', () => {
                    newIngredient.remove();
                });
            });
        }
    });

    // Add remove functionality to initial ingredients
    document.querySelectorAll('.remove-ingredient').forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.ingredient-row').remove();
        });
    });

    // Day tab switching
    const dayTabs = document.querySelectorAll('.day-tab');
    const dayPanels = document.querySelectorAll('.day-panel');

    dayTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetDay = tab.dataset.day;

            // Update tabs
            dayTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update panels
            dayPanels.forEach(panel => panel.classList.remove('active'));
            const targetPanel = document.getElementById(`panel-${targetDay}`);
            if (targetPanel) targetPanel.classList.add('active');
        });
    });

    // Reset form
    const resetBtn = document.getElementById('reset-form-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            mealPlanForm.reset();
            hideError();
        });
    }

    // Shopping list
    const shoppingListBtn = document.getElementById('shopping-list-btn');
    if (shoppingListBtn) {
        shoppingListBtn.addEventListener('click', () => {
            const ingredients = [];
            days.forEach(day => {
                const inputs = document.querySelectorAll(`input[name="${day}[ingredients][]"]`);
                inputs.forEach(input => {
                    if (input.value.trim()) ingredients.push(`${day.charAt(0).toUpperCase() + day.slice(1)}: ${input.value.trim()}`);
                });
            });
            if (ingredients.length === 0) {
                showError('No ingredients found. Add ingredients to generate a shopping list.');
                return;
            }
            const listText = ingredients.map((i, idx) => `${idx + 1}. ${i}`).join('\n');
            showToast(`Shopping List:\n${listText}`);
        });
    }

    // Form submission
    if (mealPlanForm) {
        mealPlanForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            hideError();

            const formData = new FormData(mealPlanForm);
            const mealPlanData = {
                planName: formData.get('planName'),
                description: formData.get('description'),
                userId: localStorage.getItem('userId'),
                days: {}
            };

            days.forEach(day => {
                const ingredients = Array.from(formData.getAll(`${day}[ingredients][]`)).filter(i => i.trim());
                mealPlanData.days[day] = {
                    meal: formData.get(`${day}[meal]`),
                    ingredients: ingredients,
                    instructions: formData.get(`${day}[instructions]`)
                };
            });

            // Validate required fields
            let missing = [];
            if (!mealPlanData.planName) missing.push('Meal Plan Name');
            days.forEach(day => {
                if (!mealPlanData.days[day].meal) missing.push(`${day.charAt(0).toUpperCase() + day.slice(1)} meal`);
            });
            if (missing.length > 0) {
                showError(`Please fill in: ${missing.join(', ')}`);
                return;
            }

            try {
                const endpoint = mealPlanId ? `/api/meal-plans/${mealPlanId}` : '/api/meal-plans';
                const method = mealPlanId ? 'PUT' : 'POST';

                const response = await fetch(endpoint, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    },
                    body: JSON.stringify(mealPlanData)
                });

                if (!response.ok) {
                    throw new Error('Failed to save meal plan');
                }

                const result = await response.json();
                showToast('Meal plan saved successfully!');

                // Show print button
                const printBtn = document.getElementById('print-meal-plan-btn');
                if (printBtn) {
                    printBtn.style.display = 'block';
                }
            } catch (error) {
                console.error('Error saving meal plan:', error);
                showError('Failed to save meal plan. Please try again.');
            }
        });
    }
});

/**
 * Load meal plan data by ID.
 * @param {string} id - The meal plan ID
 */
async function loadMealPlanData(id) {
    try {
        const response = await fetch(`/api/meal-plans/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to load meal plan');
        }

        const result = await response.json();

        if (!result.success || !result.mealPlan) {
            throw new Error('Invalid meal plan data structure');
        }

        populateForm(result.mealPlan);
    } catch (error) {
        console.error('Error loading meal plan:', error);
        showError(`Error loading meal plan: ${error.message}`);
    }
}

/**
 * Populate form with meal plan data.
 * @param {Object} mealPlan - The meal plan object
 */
function populateForm(mealPlan) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    document.getElementById('plan-name').value = mealPlan.planName || '';
    document.getElementById('plan-description').value = mealPlan.description || '';

    days.forEach(day => {
        const dayData = mealPlan.days[day] || {
            meal: '',
            ingredients: [],
            instructions: ''
        };

        document.getElementById(`${day}-meal`).value = dayData.meal || '';
        document.getElementById(`${day}-instructions`).value = dayData.instructions || '';

        const ingredientsList = document.getElementById(`${day}-ingredients-list`);
        if (ingredientsList) {
            ingredientsList.innerHTML = '';

            if (dayData.ingredients && dayData.ingredients.length > 0) {
                dayData.ingredients.forEach(ingredient => {
                    const newIngredient = document.createElement('div');
                    newIngredient.className = 'ingredient-row';
                    newIngredient.innerHTML = `
                        <input type="text" name="${day}[ingredients][]" value="${escapeHtml(ingredient)}" placeholder="Enter ingredient" required>
                        <button type="button" class="btn btn-outline btn-sm remove-ingredient">Remove</button>
                    `;
                    ingredientsList.appendChild(newIngredient);

                    newIngredient.querySelector('.remove-ingredient').addEventListener('click', () => {
                        newIngredient.remove();
                    });
                });
            }
        }
    });
}

/**
 * Escape HTML to prevent XSS.
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Show toast message.
 * @param {string} message - Toast message
 */
function showToast(message) {
    const toast = document.getElementById('toast-message');
    if (toast) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}
