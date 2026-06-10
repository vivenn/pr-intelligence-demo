import { createApp } from './app';
import { env } from './shared/config/env';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`PR Intelligence backend listening on port ${env.PORT}`);
});
