/**
 * Next.js Instrumentation
 * Runs once when server starts
 * Used to initialize background services
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('🚀 Server starting - Initializing services...');
    
    try {
      const { initializePingService } = await import('./lib/ping-service-init');
      
      // Wait a bit for database to be ready
      setTimeout(async () => {
        const result = await initializePingService();
        if (result.success) {
          console.log('✅ All services initialized successfully');
        } else {
          console.error('❌ Service initialization failed:', result.error);
        }
      }, 2000); // 2 second delay
      
    } catch (error) {
      console.error('❌ Failed to initialize services:', error);
    }
  }
}
