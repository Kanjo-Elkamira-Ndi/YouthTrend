import morgan from 'morgan';
import { env } from '../config/env';

/**
 * Development: coloured, concise output.
 * Production:  JSON-style for log aggregators.
 */
export const requestLogger = env.NODE_ENV === 'production'
  ? morgan('combined')
  : morgan(':method :url :status :response-time ms — :res[content-length] bytes');