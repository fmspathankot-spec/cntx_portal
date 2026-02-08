// test.js
const { executeCommand } = require('./sshHelper');

async function main() {
    const router = {
        hostname: 'TejasRouter',
        ip_address: '10.125.0.5',
        username: 'bsnlmasr',
        password: 'bsnlasrm',
        ssh_port: 22,
    };

    try {
        const output = await executeCommand(router, 'show system info');
        console.log('Router Output:\n', output);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

main();