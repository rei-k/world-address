/**
 * HTTP utility for making network requests with retry logic
 */

const https = require('https');
const http = require('http');

/**
 * Configuration options for HTTP requests
 * @typedef {Object} RequestOptions
 * @property {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @property {number} retryDelay - Initial delay between retries in ms (default: 1000)
 * @property {number} timeout - Request timeout in ms (default: 30000)
 * @property {boolean} exponentialBackoff - Use exponential backoff for retries (default: true)
 */

/**
 * Make an HTTP GET request with retry logic
 * @param {string} url - URL to fetch
 * @param {RequestOptions} options - Request options
 * @returns {Promise<string>} Response body
 */
function fetchWithRetry(url, options = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    timeout = 30000,
    exponentialBackoff = true,
  } = options;

  return new Promise((resolve, reject) => {
    let attempt = 0;

    const makeRequest = () => {
      const protocol = url.startsWith('https') ? https : http;
      
      const req = protocol.get(url, { timeout }, (res) => {
        let data = '';

        // Handle non-200 status codes
        if (res.statusCode !== 200) {
          const error = new Error(`HTTP ${res.statusCode}: ${url}`);
          error.statusCode = res.statusCode;
          
          // Retry on server errors (5xx) and rate limiting (429)
          if (
            (res.statusCode >= 500 || res.statusCode === 429) &&
            attempt < maxRetries
          ) {
            const delay = exponentialBackoff
              ? retryDelay * Math.pow(2, attempt)
              : retryDelay;
            
            attempt++;
            setTimeout(makeRequest, delay);
            return;
          }
          
          reject(error);
          return;
        }

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve(data);
        });
      });

      req.on('timeout', () => {
        req.destroy();
        const error = new Error(`Request timeout: ${url}`);
        error.code = 'ETIMEDOUT';
        
        if (attempt < maxRetries) {
          const delay = exponentialBackoff
            ? retryDelay * Math.pow(2, attempt)
            : retryDelay;
          
          attempt++;
          setTimeout(makeRequest, delay);
        } else {
          reject(error);
        }
      });

      req.on('error', (err) => {
        // Retry on network errors
        if (attempt < maxRetries) {
          const delay = exponentialBackoff
            ? retryDelay * Math.pow(2, attempt)
            : retryDelay;
          
          attempt++;
          setTimeout(makeRequest, delay);
        } else {
          reject(err);
        }
      });
    };

    makeRequest();
  });
}

/**
 * Parse JSON from response, handling JSONP format
 * @param {string} data - Response data
 * @returns {Object} Parsed JSON object
 */
function parseJSON(data) {
  try {
    // Try to extract JSON from JSONP format: callback({"key":"value"})
    const jsonMatch = data.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error.message}`);
  }
}

/**
 * Fetch and parse JSON data
 * @param {string} url - URL to fetch
 * @param {RequestOptions} options - Request options
 * @returns {Promise<Object>} Parsed JSON data
 */
async function fetchJSON(url, options = {}) {
  const data = await fetchWithRetry(url, options);
  return parseJSON(data);
}

/**
 * Batch fetch multiple URLs with concurrency control
 * @param {string[]} urls - Array of URLs to fetch
 * @param {Object} options - Options
 * @param {number} options.concurrency - Max concurrent requests (default: 5)
 * @param {Function} options.onProgress - Progress callback (current, total)
 * @param {RequestOptions} options.requestOptions - HTTP request options
 * @returns {Promise<Array>} Array of results
 */
async function batchFetch(urls, options = {}) {
  const {
    concurrency = 5,
    onProgress = null,
    requestOptions = {},
  } = options;

  const results = [];
  let completed = 0;

  // Process URLs in batches
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const promises = batch.map(async (url) => {
      try {
        const data = await fetchJSON(url, requestOptions);
        completed++;
        if (onProgress) {
          onProgress(completed, urls.length);
        }
        return { success: true, url, data };
      } catch (error) {
        completed++;
        if (onProgress) {
          onProgress(completed, urls.length);
        }
        return { success: false, url, error: error.message };
      }
    });

    const batchResults = await Promise.all(promises);
    results.push(...batchResults);
  }

  return results;
}

module.exports = {
  fetchWithRetry,
  parseJSON,
  fetchJSON,
  batchFetch,
};
