require('./db'); // ensure DB and tables exist
const app = require('./app');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bookmarks API running at http://localhost:${PORT}`);
});
