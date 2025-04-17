const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {
    createUser,
    findUserByUsername,
    getAllUsers,
    saveRefreshToken,
    findRefreshToken
} = require('../models/user.model');
require('dotenv').config();

exports.register = async (req, res) => {
    const { username, password } = req.body;
    const existing = findUserByUsername(username);
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    try {
        createUser(username, hashed);
        res.json({ message: 'User registered' });
    } catch (e) {
        res.status(500).json({ message: 'Database error', error: e.message });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    const user = findUserByUsername(username);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });

    res.json({ token });
};

exports.verify = (req, res) => {
    res.json({ message: 'Token valid', user: req.user });
};


function generateAccessToken(user) {
    return jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.ACCESS_EXPIRES_IN }
    );
}

function generateRefreshToken(user) {
    return jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.REFRESH_EXPIRES_IN }
    );
}

exports.login = async (req, res) => {
    const { username, password } = req.body;
    const user = findUserByUsername(username);
    if (!user || !(await bcrypt.compare(password, user.password)))
        return res.status(400).json({ message: 'Invalid credentials' });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    saveRefreshToken(user.id, refreshToken);

    res.json({ accessToken, refreshToken });
};

exports.refreshToken = (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(401).json({ message: 'Token missing' });

    const stored = findRefreshToken(token);
    if (!stored) return res.status(403).json({ message: 'Invalid refresh token' });

    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Token invalid' });

        const newAccessToken = generateAccessToken({ id: decoded.id, username: decoded.username });
        res.json({ accessToken: newAccessToken });
    });
};



exports.getUsers = (req, res) => {
    const users = getAllUsers();
    res.json(users);
};

