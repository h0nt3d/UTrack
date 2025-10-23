import React, { useState } from 'react';
import Login from '@react-login-page/page9';
import LoginBg from '@react-login-page/page9/bg.jpg';
import { fetchLogin } from './loginApi';

const SigninInst = () => {
    const [error, setError] = useState('');

    const handleLogin = async (event) => {
        event.preventDefault();
        setError('');
        
        try {
            const formData = new FormData(event.target);
            const formDataObj = Object.fromEntries(formData);
            
            // Extract username and password from form data
            const username = formDataObj.username;
            const password = formDataObj.password;
            
            const loginData = {
                email: username,
                password: password
            };
            
            const result = await fetchLogin(loginData);
            
            
            if (result.success) {
                // Store user data and token in localStorage
                localStorage.setItem('email', result.data.user?.email || username);
                localStorage.setItem('token', result.data.token);
                localStorage.setItem('user', JSON.stringify(result.data.user));
                localStorage.setItem('firstName', result.data.user.firstName);
                localStorage.setItem('lastName', result.data.user.lastName);
                // Navigate to profile page
                window.location.href = '/profile';
            } else {
                setError(result.error || 'Login failed');
            }
        } catch (err) {
            setError('An error occurred during login');
            console.error('Login error:', err);
        }
    };

    return (
        <div>
            {error && (
                <div style={{ 
                    color: 'red', 
                    textAlign: 'center', 
                    padding: '10px',
                    backgroundColor: '#ffebee',
                    border: '1px solid #f44336',
                    borderRadius: '4px',
                    margin: '10px'
                }}>
                    {error}
                </div>
            )}  
            <form onSubmit={handleLogin}>
            <Login 
                style={{ height: 690, backgroundImage: `url(${LoginBg})` }}>
            </Login>
            </form>
        </div>
    );
}

export default SigninInst;
