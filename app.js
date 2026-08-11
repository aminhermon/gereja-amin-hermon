// app.js — Phusion Passenger entry point for Hostinger
// Hostinger's Node.js hosting uses Phusion Passenger which expects an app.js file.
const app = require('./server');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
