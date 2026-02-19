const axios = require('axios');

const testLogin = async () => {
    const API_URL = 'https://online-voting-system-backend-1aph.onrender.com/api';

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
