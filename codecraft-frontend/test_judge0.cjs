const axios = require('axios');
const fs = require('fs');

const envContent = fs.readFileSync('./.env', 'utf8');
const lines = envContent.split(/\r?\n/);
const getEnvVar = (key) => {
    const line = lines.find(l => l.trim().startsWith(`${key}=`));
    return line ? line.split('=')[1].trim().replace(/^["']|["']$/g, '') : null;
};

const JUDGE0_KEY = getEnvVar('VITE_JUDGE0_KEY');
const JUDGE0_HOST = 'judge0-ce.p.rapidapi.com';

async function testJudge0() {
    console.log('Testing Judge0 with key:', JUDGE0_KEY ? 'Present' : 'Missing');
    if (!JUDGE0_KEY) return;

    try {
        const response = await axios.get(`https://${JUDGE0_HOST}/languages`, {
            headers: {
                'X-RapidAPI-Key': JUDGE0_KEY,
                'X-RapidAPI-Host': JUDGE0_HOST,
            }
        });
        console.log('Success! Languages found:', response.data.length);
    } catch (error) {
        console.error('Error testing Judge0:', error.response ? error.response.status : error.message);
        if (error.response && error.response.data) {
            console.error('Data:', JSON.stringify(error.response.data));
        }
    }
}

testJudge0();
