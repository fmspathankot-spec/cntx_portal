const { NodeSSH } = require('node-ssh');

async function runInteractive(router) {
    const ssh = new NodeSSH();
    await ssh.connect({
        host: router.ip_address,
        username: router.username,
        password: router.password,
        port: router.ssh_port || 22,
    });

    const stream = await ssh.requestShell();

    // Router se jo bhi output aayega, yahan print hoga
    stream.on('data', (data) => {
        console.log('Router Output:\n', data.toString());
    });

    // Command bhejna
    stream.write('show system info\n');
    stream.write('show ip int br\n');
    stream.write('show ip ospf neighbor\n');
    stream.write('show ip bgp summary sorted\n');



    // 5 second baad session close kar dena
    setTimeout(() => {
        stream.end('exit\n');
        ssh.dispose();
    }, 5000);
}

const router = {
    hostname: 'TejasRouter',
    ip_address: '10.125.0.5',
    username: 'bsnlmasr',
    password: 'bsnlasrm',
};

runInteractive(router);