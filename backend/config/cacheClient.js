// config/cacheClient.js
import redis from 'redis';
import dotenv from 'dotenv';
import { promisify } from 'util';

dotenv.config();

class CacheClient {
  constructor() {
    this.client = null;
    this.inMemoryCache = new Map(); // Fallback en memoria
    this.connect();
  }

  connect() {
    if (process.env.REDIS_URL) {
      try {
        this.client = redis.createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true, // Obligatorio para Redis Cloud
    rejectUnauthorized: false
  }
});

        this.client.on('connect', () => {
          console.log('✅ Conectado a Redis');
        });

        this.client.on('error', (err) => {
          console.error('Redis Error:', err);
          this.client = null;
        });

        // Promisificar métodos
        this.getAsync = promisify(this.client.get).bind(this.client);
        this.setAsync = promisify(this.client.set).bind(this.client);
        this.delAsync = promisify(this.client.del).bind(this.client);
        this.flushAsync = promisify(this.client.flushall).bind(this.client);
        
        this.client.connect();

      } catch (error) {
        console.error('Error connecting to Redis:', error);
        this.client = null;
      }
    }
  }

  async get(key) {
    if (this.client?.isOpen) {
      try {
        return await this.client.get(key);
      } catch (error) {
        console.error('Redis GET Error:', error);
        return this.inMemoryCache.get(key);
      }
    }
    return this.inMemoryCache.get(key);
  }

  async set(key, value, ttl = 3600) { // TTL por defecto 1 hora
    if (this.client?.isOpen) {
      try {
        await this.client.set(key, value, 'EX', ttl);
      } catch (error) {
        console.error('Redis SET Error:', error);
        this.inMemoryCache.set(key, value, ttl);
      }
    } else {
      this.inMemoryCache.set(key, value);
      setTimeout(() => {
        this.inMemoryCache.delete(key);
      }, ttl * 1000);
    }
  }

  async del(keys) {
    if (this.client?.isOpen) {
      try {
        await this.client.del(keys);
      } catch (error) {
        console.error('Redis DEL Error:', error);
        keys.forEach(key => this.inMemoryCache.delete(key));
      }
    } else {
      keys.forEach(key => this.inMemoryCache.delete(key));
    }
  }

  async flush() {
    if (this.client?.isOpen) {
      try {
        await this.client.flushAll();
      } catch (error) {
        console.error('Redis FLUSH Error:', error);
        this.inMemoryCache.clear();
      }
    } else {
      this.inMemoryCache.clear();
    }
  }
}

const cacheClient = new CacheClient();

export default cacheClient;