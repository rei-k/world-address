/**
 * Test Configuration
 * テスト設定
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load test environment variables
dotenv.config({ path: path.join(__dirname, '.env.test') });

export interface DatabaseConfig {
  postgres: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    ssl: boolean;
  };
  mongodb: {
    uri: string;
    database: string;
  };
  mysql: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  };
  sqlite: {
    path: string;
  };
}

export interface CloudServiceConfig {
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId?: string;
    appId?: string;
    serviceAccountKey?: string;
    serviceAccountJson?: object;
  };
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  };
  aws: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    s3Bucket: string;
    dynamodbTable?: string;
  };
  gcp: {
    projectId: string;
    credentials: string;
    storageBucket: string;
    firestoreDb?: string;
  };
  azure: {
    storage: {
      connectionString: string;
      container: string;
    };
    cosmosDb: {
      endpoint: string;
      key: string;
      database: string;
    };
  };
}

export interface TestConfig {
  timeout: number;
  concurrency: number;
  cleanup: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Get database configuration
 * データベース設定を取得
 */
export function getDatabaseConfig(): DatabaseConfig {
  return {
    postgres: {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
      database: process.env.POSTGRES_DB || 'vey_test',
      user: process.env.POSTGRES_USER || 'vey_user',
      password: process.env.POSTGRES_PASSWORD || '',
      ssl: process.env.POSTGRES_SSL === 'true',
    },
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/vey_test',
      database: process.env.MONGODB_DB || 'vey_test',
    },
    mysql: {
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306', 10),
      database: process.env.MYSQL_DB || 'vey_test',
      user: process.env.MYSQL_USER || 'vey_user',
      password: process.env.MYSQL_PASSWORD || '',
    },
    sqlite: {
      path: process.env.SQLITE_DB_PATH || './tests/integration/data/vey_test.db',
    },
  };
}

/**
 * Get cloud service configuration
 * クラウドサービス設定を取得
 */
export function getCloudServiceConfig(): CloudServiceConfig {
  let serviceAccountJson: object | undefined;
  
  // Safely parse Firebase service account JSON
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      serviceAccountJson = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } catch (error) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON');
      serviceAccountJson = undefined;
    }
  }

  return {
    firebase: {
      apiKey: process.env.FIREBASE_API_KEY || '',
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      serviceAccountKey: process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
      serviceAccountJson,
    },
    supabase: {
      url: process.env.SUPABASE_URL || '',
      anonKey: process.env.SUPABASE_ANON_KEY || '',
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    },
    aws: {
      region: process.env.AWS_REGION || 'ap-northeast-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      s3Bucket: process.env.AWS_S3_BUCKET || 'vey-test-bucket',
      dynamodbTable: process.env.AWS_DYNAMODB_TABLE,
    },
    gcp: {
      projectId: process.env.GCP_PROJECT_ID || '',
      credentials: process.env.GCP_CREDENTIALS || '',
      storageBucket: process.env.GCP_STORAGE_BUCKET || 'vey-test-bucket',
      firestoreDb: process.env.GCP_FIRESTORE_DB,
    },
    azure: {
      storage: {
        connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || '',
        container: process.env.AZURE_STORAGE_CONTAINER || 'vey-test-container',
      },
      cosmosDb: {
        endpoint: process.env.AZURE_COSMOS_DB_ENDPOINT || '',
        key: process.env.AZURE_COSMOS_DB_KEY || '',
        database: process.env.AZURE_COSMOS_DB_DATABASE || 'vey_test',
      },
    },
  };
}

/**
 * Get test configuration
 * テスト設定を取得
 */
export function getTestConfig(): TestConfig {
  return {
    timeout: parseInt(process.env.TEST_TIMEOUT || '30000', 10),
    concurrency: parseInt(process.env.TEST_CONCURRENCY || '1', 10),
    cleanup: process.env.TEST_CLEANUP !== 'false',
    logLevel: (process.env.TEST_LOG_LEVEL as TestConfig['logLevel']) || 'info',
  };
}

/**
 * Check if a service is configured
 * サービスが設定されているかチェック
 */
export function isServiceConfigured(service: string): boolean {
  switch (service) {
    case 'postgres':
      return !!process.env.POSTGRES_PASSWORD;
    case 'mongodb':
      return !!process.env.MONGODB_URI;
    case 'mysql':
      return !!process.env.MYSQL_PASSWORD;
    case 'sqlite':
      return true; // Always available
    case 'firebase':
      return !!process.env.FIREBASE_PROJECT_ID;
    case 'supabase':
      return !!process.env.SUPABASE_URL;
    case 'aws':
      return !!process.env.AWS_ACCESS_KEY_ID;
    case 'gcp':
      return !!process.env.GCP_PROJECT_ID;
    case 'azure':
      return !!process.env.AZURE_STORAGE_CONNECTION_STRING;
    default:
      return false;
  }
}

/**
 * Skip test if service is not configured
 * サービスが設定されていない場合はテストをスキップ
 */
export function skipIfNotConfigured(service: string): void {
  if (!isServiceConfigured(service)) {
    console.warn(`⚠️  Skipping ${service} tests: Service not configured`);
    console.warn(`   Configure ${service} in tests/integration/config/.env.test to enable tests`);
  }
}

export default {
  getDatabaseConfig,
  getCloudServiceConfig,
  getTestConfig,
  isServiceConfigured,
  skipIfNotConfigured,
};
