// sshHelper.js
const { NodeSSH } = require('node-ssh');

async function executeCommand(router, command, timeout = 30000) {
    const ssh = new NodeSSH();
    try {
        console.log(`[SSH] Connecting to ${router.hostname} (${router.ip_address})...`);

        await ssh.connect({
            host: router.ip_address,
            username: router.username || 'admin',
            password: router.password,
            port: router.ssh_port || 22,
            readyTimeout: timeout,
            tryKeyboard: true,
        });

        console.log(`[SSH] Connected to ${router.hostname}`);
        console.log(`[SSH] Executing: ${command}`);

        const result = await ssh.execCommand(command, {
            cwd: '/',
            timeout: timeout,
        });

        if (result.code !== 0) {
            throw new Error(`Command failed: ${result.stderr || 'Unknown error'}`);
        }

        ssh.dispose();
        return result.stdout;

    } catch (error) {
        ssh.dispose();
        throw error;
    }
}

module.exports = { executeCommand };