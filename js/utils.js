const utils = 
{
    storage: 
	{
        get(key) 
		{
            try 
			{
                return JSON.parse(localStorage.getItem(key));
            } 
			catch (error) 
			{
                console.error(`Error reading ${key} from storage:`, error);
                return null;
            }
        },
		
        set(key, value) 
		{
            try 
			{
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } 
			catch (error) 
			{
                console.error(`Error saving ${key} to storage:`, error);
                return false;
            }
        }
    },
    

    loading: 
	{
        show(element) 
		{
            element.classList.add('loading');
        },
		
        hide(element) 
		{
            element.classList.remove('loading');
        }
    },
    
    handleError(error, message = 'An error occurred') 
	{
        console.error(error);
        this.notifications.error(message);
    },
    

    notifications: 
	{
        show(message, type = 'success') 
		{
            // shows notification if correct, will know when API
        },
		
        success(message) 
		{
            this.show(message, 'success');
        },
		
        error(message) 
		{
            this.show(message, 'error');
        }
    },


    setupApiInterceptors() 
	{
        $(document).ajaxSend((event, xhr) => 
		{
            if (localStorage.getItem('authToken')) 
			{
                xhr.setRequestHeader(
                    'Authorization',
                    `Bearer ${localStorage.getItem('authToken')}`
                );
            }
        });

        $(document).ajaxError((event, xhr) => 
		{
            if (xhr.status === 401) 
			{
                localStorage.removeItem('authToken');
                window.location.href = '/signin.html';
            }
        });
    }
}; 

class ApiClient 
{
    constructor() 
	{
        this.baseUrl = '/api/v1';
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    async request(method, endpoint, data = null) 
	{
        const url = `${this.baseUrl}/${endpoint}`;
        const headers = 
		{
            ...this.defaultHeaders,
            ...(localStorage.getItem('token') && 
			{
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            })
        };



        const config = 
		{
            method: method.toUpperCase(),
            headers: headers,
            credentials: 'include'
        };

        if (data) 
		{
            config.body = JSON.stringify(data);
        }

        try 
		{
            const response = await fetch(url, config);
            
            if (!response.ok) 
			{
                const errorData = await response.json();
                throw new Error(errorData.message || 'Request failed');
            }

            return response.headers.get('Content-Type')?.includes('json') 
                ? await response.json() 
                : await response.text();
            
        } 
		
		catch (error) 
		{
            console.error(`API Error (${method} ${endpoint}):`, error);
            throw error;
        }
    }

    create(resource, data) 
	{
        return this.request('POST', resource, data);
    }

    read(resource, id = '') 
	{
        return this.request('GET', `${resource}/${id}`);
    }

    update(resource, id, data) 
	{
        return this.request('PUT', `${resource}/${id}`, data);
    }

    delete(resource, id) 
	{
        return this.request('DELETE', `${resource}/${id}`);
    }

    async login(credentials) 
	{
        const response = await this.request('POST', 'auth/login', credentials);
        localStorage.setItem('token', response.access_token);
        return response;
    }

    async register(userData) 
	{
        return this.request('POST', 'auth/register', userData);
    }

    async logout() 
	{
        await this.request('POST', 'auth/logout');
        localStorage.removeItem('token');
    }
}

export const api = new ApiClient(); 