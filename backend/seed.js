// backend/seed.js - Delegate to root seed.js
const path = require('path');
process.chdir(path.join(__dirname, '..'));
require('../seed.js');
