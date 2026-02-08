'use client';
import { useState } from 'react';

export default function Home() {
    const [output, setOutput] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchOutput = async () => {
        setLoading(true);
        const res = await fetch('/api/router');
        const data = await res.json();
        setOutput(data.output || data.error);
        setLoading(false);
    };

    return (
        <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif' }}>
            <h1>📡 Tejas Router OSPF Neighbors</h1>
            <button
                onClick={fetchOutput}
                disabled={loading}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#0070f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
            >
                {loading ? 'Fetching...' : 'Run "sh ip ospf nei"'}
            </button>

            {output && (
                <div style={{ marginTop: '30px' }}>
                    <h2>Raw Output</h2>
                    <pre
                        style={{
                            whiteSpace: 'pre',
                            fontFamily: 'monospace',
                            background: '#111',
                            color: '#0f0',
                            padding: '15px',
                            borderRadius: '5px',
                            overflowX: 'auto',
                        }}
                    >
            {output}
          </pre>
                </div>
            )}
        </div>
    );
}