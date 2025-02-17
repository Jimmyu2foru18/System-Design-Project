async function handleRecipeSubmission(event) {
    event.preventDefault();
    
    try {

        dispatchDatabaseEvent('recipeCreated', {
            recipeId: 'new-recipe-id'
        });
        
    } catch (error) {
        console.error('Error creating recipe:', error);
    }
} 