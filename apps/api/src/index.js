const express = require("express");

const app = express();
app.use(express.json());
const PORT = 3001;

// This will be filled in during the live coding session

app.listen(PORT, () => {
  console.log(`Express API server listening on http://localhost:${PORT}`);
});
