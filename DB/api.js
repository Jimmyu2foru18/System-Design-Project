const Api = 
{
    get: async (endpoint, params = {}) => 
	{
        try 
		{
            const response = await $.ajax(
			{
                url: `/api/${endpoint}`,
                method: 'GET',
                data: params,
                dataType: 'json'
            });
            
			return response;
        } 
		
		catch (error) 
		{
            console.error('GET Error:', error);
            throw error;
        }
    },

    post: async (endpoint, data = {}) => 
	{
        try 
		{
            const response = await $.ajax(
			{
                url: `/api/${endpoint}`,
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(data),
                dataType: 'json'
            });
			
            return response;
        } 
		
		catch (error) 
		{
            console.error('POST Error:', error);
            throw error;
        }
    }
};