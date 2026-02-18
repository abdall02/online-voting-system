const axios = require('axios');

const testLogin = async () => {
    const API_URL = 'http://localhost:5000/api';

    console.log('--- Testing Admin Login ---');
    try {
        const res = await axios.post(`${API_URL}/auth/login`, {
            email: 'uobgadmin@gmail.com',
            password: 'uobg123'
        });
        console.log('Admin Login Success:', res.data.success);
    } catch (err) {
        console.log('Admin Login Failed:', err.response?.data || err.message);
    }

    console.log('\n--- Testing Student Login ---');
    try {
        const res = await axios.post(`${API_URL}/auth/login`, {
            email: 'abdalle@gmail.com',
            password: 'uobg123'
        });
        console.log('Student Login Success:', res.data.success);
    } catch (err) {
        console.log('Student Login Failed:', err.response?.data || err.message);
    }
};

testLogin();
