const Post = require('../models/post');
const adminLayout = '../views/layouts/admin';

exports.addPost = async (req, res) => {
    try {
        const newPost = new Post({
            title: req.body.title,
            body: req.body.body
        });

        await Post.create(newPost);
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
};

exports.renderAddPostForm = async (req, res) => {
    try {
        const locals = {
            title: "Add Post",
            description: "Simple Blog created with NodeJs, Express & MongoDb."
        }

        const data = await Post.find();
        res.render('admin/add-post', {
            locals,
            layout: adminLayout
        });
    } catch (error) {
        console.log(error);
    }
};

exports.editPostId = async (req, res) => {

    try {

        const locals = {
            title: "Edit Post",
            description:"Free NodeJs User Management System."
        }
        const data = await Post.findOne({ _id: req.params.id});

        res.render('admin/edit-post', {
            locals,
            data,
            layout: adminLayout
        })


    } catch (error) {
        console.log(error);
    }

};

exports.deletePost = async (req, res) => {
    try {
        await Post.deleteOne({ _id: req.params.id });
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
};