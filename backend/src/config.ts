import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface Config {
  env: string;
  port: string | number;
  mongodb: {
    uri: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
  cors: {
    origins: string[];
  };
  paths: {
    frontendDist: string;
  };
}

const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  mongodb: {
    uri: process.env.MONGO_DB as string,
  },
  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresIn: '7d',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
    apiKey: process.env.CLOUDINARY_API_KEY as string,
    apiSecret: process.env.CLOUDINARY_API_SECRET as string,
  },
  cors: {
    origins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:5173'],
  },
  paths: {
    frontendDist: path.join(__dirname, '../../frontend/dist'),
  }
};

// Validate required config
const requiredConfigs: (keyof Config | string)[] = [
  'mongodb.uri',
  'jwt.secret',
  'cloudinary.cloudName',
  'cloudinary.apiKey',
  'cloudinary.apiSecret',
];

const getNestedConfig = (obj: any, path: string) => path.split('.').reduce((o, i) => o[i], obj);

requiredConfigs.forEach(key => {
  if (!getNestedConfig(config, key)) {
    throw new Error(`Configuration Error: Missing ${key}`);
  }
});

export default config;
