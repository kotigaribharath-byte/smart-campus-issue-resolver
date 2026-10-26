/**
 * High-performance In-Memory LRU Cache with TTL for CampusFix Chatbot
 * - Caches general campus inquiries (SLA, policy, instructions)
 * - Caches user-specific ticket status responses with live state hashing
 * - Auto-invalidates when ticket status changes
 */
class ChatCache {
  constructor(maxSize = 1000, defaultTtlSeconds = 300) {
    this.maxSize = maxSize;
    this.defaultTtl = defaultTtlSeconds * 1000;
    this.cache = new Map();
    this.hits = 0;
    this.misses = 0;

    // Periodic sweep every 5 minutes to clean expired entries
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.sweep(), 5 * 60 * 1000);
      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref();
      }
    }
  }

  /**
   * Normalize input prompt string for deterministic cache keying
   */
  normalizePrompt(prompt = '') {
    return String(prompt)
      .toLowerCase()
      .trim()
      .replace(/[?!.,;:'"()]+/g, '')
      .replace(/\s+/g, ' ');
  }

  /**
   * Generate cache key based on query type and user context
   */
  generateKey({ userId, query, isUserSpecific = false, ticketStateHash = '' }) {
    const cleanQuery = this.normalizePrompt(query);
    if (isUserSpecific) {
      return `user_${userId}:${cleanQuery}:${ticketStateHash}`;
    }
    return `global:${cleanQuery}`;
  }

  /**
   * Retrieve cached value if exists and not expired
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) {
      this.misses++;
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Refresh LRU position (delete & re-insert)
    this.cache.delete(key);
    this.cache.set(key, item);
    this.hits++;

    return item.value;
  }

  /**
   * Store value with specific TTL
   */
  set(key, value, ttlSeconds) {
    const ttlMs = (ttlSeconds ? ttlSeconds * 1000 : this.defaultTtl);
    const expiresAt = Date.now() + ttlMs;

    // Evict oldest if reaching capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Invalidate all cached queries for a given user
   */
  invalidateUser(userId) {
    if (!userId) return;
    const prefix = `user_${userId}:`;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clean expired entries
   */
  sweep() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear entire cache
   */
  clear() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Cache metrics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits + this.misses > 0
        ? `${Math.round((this.hits / (this.hits + this.misses)) * 100)}%`
        : '0%',
    };
  }
}

export const chatCache = new ChatCache(1000, 300);
