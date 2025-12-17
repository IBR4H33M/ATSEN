import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

dotenv.config();

async function testRedis() {
  console.log('🔍 Testing Upstash Redis Connection...\n');
  
  console.log('Environment Variables:');
  console.log('UPSTASH_REDIS_REST_URL:', process.env.UPSTASH_REDIS_REST_URL ? '✓ Set' : '✗ Not set');
  console.log('UPSTASH_REDIS_REST_TOKEN:', process.env.UPSTASH_REDIS_REST_TOKEN ? '✓ Set' : '✗ Not set');
  console.log('');

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.log('❌ Redis credentials not configured');
    process.exit(1);
  }

  try {
    console.log('Attempting to connect to:', process.env.UPSTASH_REDIS_REST_URL);
    
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    console.log('Sending PING command...');
    const result = await redis.ping();
    
    console.log('✅ Redis connection successful!');
    console.log('Response:', result);
    
    // Test set/get
    console.log('\nTesting SET/GET...');
    await redis.set('test-key', 'test-value');
    const value = await redis.get('test-key');
    console.log('✅ SET/GET successful:', value);
    
    process.exit(0);
  } catch (error) {
    console.log('❌ Redis connection failed!');
    console.log('Error:', error.message);
    console.log('\nPossible causes:');
    console.log('1. Network/DNS issue - cannot resolve upstash.io');
    console.log('2. Firewall blocking the connection');
    console.log('3. Invalid credentials');
    console.log('4. Upstash service is down');
    process.exit(1);
  }
}

testRedis();
