import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

/**
 * Connects to MongoDB Atlas with bounded retries. We retry on initial
 * connection failure (e.g. a slow Atlas cold start) but exit the process
 * if we still can't connect after MAX_RETRIES — a server with no database
 * should not stay up pretending to be healthy.
 */
export async function connectDB(attempt = 1) {
  try {
    mongoose.set('strictQuery', true);

    await mongoose.connect(env.mongoUri, {
      maxPoolSize: 10,
    });

    logger.info('MongoDB connected');

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
      logger.error({ err }, 'MongoDB connection error');
    });
  } catch (err) {
    logger.error({ err: err.message, attempt }, 'MongoDB connection failed');

    if (attempt >= MAX_RETRIES) {
      logger.error('Max MongoDB connection retries reached — exiting');
      process.exit(1);
    }

    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    return connectDB(attempt + 1);
  }
}