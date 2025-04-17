const db = require('../db/db');

exports.createUser = (username, password) => {
    const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
    stmt.run(username, password);
};

exports.findUserByUsername = (username) => {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username);
};

exports.getAllUsers = () => {
    const stmt = db.prepare('SELECT id, username FROM users');
    return stmt.all();
};


exports.saveRefreshToken = (userId, token) => {
    const stmt = db.prepare('INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)');
    stmt.run(userId, token);
};

exports.findRefreshToken = (token) => {
    const stmt = db.prepare('SELECT * FROM refresh_tokens WHERE token = ?');
    return stmt.get(token);
};

exports.deleteRefreshToken = (token) => {
    const stmt = db.prepare('DELETE FROM refresh_tokens WHERE token = ?');
    stmt.run(token);
};