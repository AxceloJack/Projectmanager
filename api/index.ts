import app from '../apps/backend/src/app.js';
import { setupDefaultAdmin } from '../apps/backend/src/setup.js';

// Warm the default admin check on cold start; requests don't wait on it.
setupDefaultAdmin();

export default app;
