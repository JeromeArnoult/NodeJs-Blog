const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const User = require('../models/user');
const postsCtrl = require('../controller/postsCtrl');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authController = require('../controller/authController');
const upload = require('../config/multer');
const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;

/**
 * GET /
 * Admin - Login Page
 */
router.get('/admin', async (req, res) => {
    try {
        const locals = {
            title: "Admin",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
        };
        res.render('admin/index', { locals, layout: adminLayout });
    } catch (error) {
        console.log(error);
    }
});

/**
 * POST /
 * Admin - Check Login 
 */
router.post('/admin', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, jwtSecret);
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
});

/**
 * GET /
 * Admin - Dashboard
 */
router.get('/dashboard', authController.authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Dashboard",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
        };

        const data = await Post.find();
        res.render('admin/dashboard', {
            locals,
            data,
            layout: adminLayout
        });
    } catch (error) {
        console.log(error);
    }
});

/**
 * POST /
 * Admin - Create new post
 */
router.post('/add-post', authController.authMiddleware, upload.single('image'), (req, res, next) => {
    console.log('Fichier uploadé:', req.file);  // Log pour débogage
    next();
}, postsCtrl.addPost);

/**
 * GET /
 * Admin - Read post
 */
router.get('/add-post', authController.authMiddleware, postsCtrl.renderAddPostForm);

/**
 * GET /
 * Admin - Edit post
 */
router.get('/edit-post/:id', authController.authMiddleware, postsCtrl.editPostId);

/**
 * PUT /
 * Admin - Edit post
 */
router.put('/edit-post/:id', authController.authMiddleware, postsCtrl.editPostId);

/**
 * DELETE /
 * Admin - DELETE post
 */
router.delete('/delete-post/:id', authController.authMiddleware, postsCtrl.deletePost);

/**
 * POST /
 * Admin - Register 
 */
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user = await User.create({ username, password: hashedPassword });
            res.status(201).json({ message: 'User Created', user });
        } catch (error) {
            if (error.code === 11000) {
                res.status(409).json({ message: 'User already in use' });
            }
            res.status(500).json({ message: 'Internal server error' });
        }
    } catch (error) {
        console.log(error);
    }
});

/**
 * GET /
 * Admin - Logout
 */
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

module.exports = router;
