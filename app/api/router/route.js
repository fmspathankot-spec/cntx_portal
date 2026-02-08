import { NextResponse } from 'next/server';
import { NodeSSH } from 'node-ssh';

export async function GET() {
    const ssh = new NodeSSH();

    const router = {
        hostname: 'TejasRouter',
        ip_address: '10.125.0.5',
        username: 'bsnlmasro2',
        password: 'bsnlasrmo2',
        ssh_port: 22,
    };

    try {
        await ssh.connect({
            host: router.ip_address,
            username: router.username,
            password: router.password,
            port: router.ssh_port,
        });

        const stream = await ssh.requestShell();
        let output = '';

        stream.on('data', (data) => {
            output += data.toString();
        });

        // Commands bhejna
         stream.write('configure terminal\n');
         stream.write('set cli pagination off\n');
         stream.write('end\n');
        stream.write('show ip ospf neighbor\n');
        stream.write('show ip bgp summary sorted\n');

        // Wait thoda aur phir close
        await new Promise((resolve) => setTimeout(resolve, 5000));

        stream.end('exit\n');
        ssh.dispose();

        return NextResponse.json({ output });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}