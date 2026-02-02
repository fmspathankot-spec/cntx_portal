import TejasMonitoringDashboard from './TejasMonitoringDashboard';

export const metadata = {
  title: 'Tejas Router Monitoring - CNTX Portal',
  description: 'Real-time monitoring of Tejas routers - OSPF, BGP, SFP',
};

export default function TejasMonitoringPage() {
  return <TejasMonitoringDashboard />;
}
