const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("MyBookDB.db");

function getRows(query, params = []) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function runQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) return reject(err);
            resolve({
                lastID: this.lastID,
                changes: this.changes,
                context: this,
            });
        });
    });
}

module.exports = { getRows, runQuery };
