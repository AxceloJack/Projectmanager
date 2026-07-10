import app from './app.js';
import { setupDefaultAdmin } from './setup.js';

const PORT = process.env.PORT || 3000;

setupDefaultAdmin().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
