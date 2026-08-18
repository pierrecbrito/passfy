import { app } from './app';

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`🚀 Passfy API server is running on http://localhost:${PORT}`);
});
