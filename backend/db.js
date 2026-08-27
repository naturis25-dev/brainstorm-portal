const usePg = process.env.DB_CLIENT === 'pg';
console.log(`[DB Switch] Initializing database layer. Engine: ${usePg ? 'PostgreSQL' : 'SQLite'}`);
if (usePg) {
  module.exports = require('./database.pg.js');
} else {
  module.exports = require('./database.js');
}
