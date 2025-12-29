import User from '../models/User.js';
import { hashPassword, comparePasswords } from '../jwt_services/hashService.js';
import { generateToken } from '../jwt_services/jwtService.js';

export const register = async (req, res) => {
    try{
        const { username, password } = req.body;

        //check if user alr exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return  res.status(400).json({ error: 'Username already taken' });
        };

        //hash password using hashService
        const hashedPassword = await hashPassword(password);

        //save user to db
        const user = new User({ username, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: `${username} registered successfully` });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to register' });
    }

};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        //find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        //password comparison from db (user.password) and input password (password)
        const isMatch = await comparePasswords(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        //generate JWT token
        const token = generateToken({id: user._id, username: user.username});

        res.status(200).json({ message: "Login successful", token: token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to login' });
    }
};

export const profile = async (req, res) => {
    res.json({
        message: "User profile accessed",
        user: req.user
    });
};

export default {
    register,
    login,
    profile
};