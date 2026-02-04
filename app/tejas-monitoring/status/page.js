import NodeStatusDashboard from './NodeStatusDashboard';

export const metadata = {
  title: 'Node Status - Tejas Monitoring',
  description: 'Real-time ping status monitoring of all Tejas routers',
};

export default function NodeStatusPage() {
  return <NodeStatusDashboard />;
}
