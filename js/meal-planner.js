document.addEventListener('DOMContentLoaded', () => 
{
    initializePlanner();
    setupEventListeners();
    loadSavedPlan();
});

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];


let currentPlan = 
{
    id: null,
    name: '',
    notes: '',
    createdAt: new Date().toISOString(),
    meals: {}
};



function initializePlanner() 
{
    const weekGrid = document.getElementById('week-grid');
    weekGrid.innerHTML = DAYS.map(day => `
        <div class="day-card">
            <div class="day-header">${day}</div>
            <div class="meal-slots">
                ${MEAL_TYPES.map(type => `
                    <div class="meal-slot">
                        <div class="meal-type">${type}</div>
                        <input type="text" 
                               class="meal-input"
                               data-day="${day}"
                               data-type="${type}"
                               placeholder="Enter ${type.toLowerCase()}..."
                               value="${getMealValue(day, type)}">
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
	
    document.getElementById('creation-date').textContent = new Date().toLocaleDateString();
}

function setupEventListeners() 
{
    document.getElementById('plan-name').addEventListener('input', debounce(updatePlanMeta, 500));
    document.getElementById('plan-notes').addEventListener('input', debounce(updatePlanMeta, 500));

    document.querySelectorAll('.meal-input').forEach(input => 
	{
        input.addEventListener('input', debounce(updateMeal, 500));
    });

    document.getElementById('save-plan').addEventListener('click', savePlan);
    document.getElementById('clear-plan').addEventListener('click', clearPlan);
}

function updatePlanMeta() 
{
    currentPlan.name = document.getElementById('plan-name').value;
    currentPlan.notes = document.getElementById('plan-notes').value;
    showAutosaveIndicator();
}

function updateMeal(event) 
{
    const input = event.target;
    const day = input.dataset.day;
    const type = input.dataset.type;
    
    if (!currentPlan.meals[day]) 
	{
        currentPlan.meals[day] = {};
    }
    currentPlan.meals[day][type] = input.value;
    
    showAutosaveIndicator();
}



function getMealValue(day, type) 
{
    return currentPlan.meals[day]?.[type] || '';
}





async function savePlan() 
{
    try {
        if (!currentPlan.name) 
		{
            alert('Please enter a plan name');
            return;
        }

        const savedPlan = await saveMealPlanToProfile(currentPlan);
        currentPlan.id = savedPlan.id;
        showSuccess('Meal plan saved successfully!');
    } 
	catch (error) 
	{
        console.error('Error saving meal plan:', error);
        showError('Failed to save meal plan');
    }
}




function clearPlan() 
{
    if (confirm('Are you sure you want to clear all meals?')) 
	{
        currentPlan.meals = {};
		
        document.querySelectorAll('.meal-input').forEach(input => 
		{
            input.value = '';
        });
    }
}




function loadSavedPlan() 
{
    const savedPlan = localStorage.getItem('currentMealPlan');
    if (savedPlan) 
	{
        currentPlan = JSON.parse(savedPlan);
        
        document.getElementById('plan-name').value = currentPlan.name || '';
        document.getElementById('plan-notes').value = currentPlan.notes || '';
        document.querySelectorAll('.meal-input').forEach(input => 
		{
            const day = input.dataset.day;
            const type = input.dataset.type;
            input.value = getMealValue(day, type);
        });
    }
}

function showAutosaveIndicator() 
{
    localStorage.setItem('currentMealPlan', JSON.stringify(currentPlan));
    
    const indicator = document.createElement('div');
    indicator.className = 'autosave-indicator';
    indicator.textContent = 'Autosaving...';
    document.body.appendChild(indicator);
    
    setTimeout(() => 
	{
        indicator.classList.add('show');
    }, 100);
    
    setTimeout(() => 
	{
        indicator.classList.remove('show');
        setTimeout(() => indicator.remove(), 300);
    }, 2000);
}




function debounce(func, wait) 
{
    let timeout;
    return function executedFunction(...args) 
	{
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}



// Mock API
async function saveMealPlanToProfile(plan) 
{
    return 
	{
        ...plan,
        id: plan.id || Date.now().toString()
    };
} 