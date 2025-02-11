const express = require('express');
const router = express.Router();
const Post = require('../models/post');

/*Routes*/

/**
 * GET /
 * HOME
 */
router.get('', async(req, res) => {
    try {
        const locals = {
        title: "Pet's Friends",
        description:"Simple Blog created with NodeJs, Express & MongoDb."
    }
    let perPage = 2 ;
    let page = req.query.page || 1;

    const data = await Post.aggregate([{$sort: { createdAt: -1 } } ])
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec();

    const count = await Post.countDocuments();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render('index', { 
        locals, 
        data,
        current: page,
        nextPage: hasNextPage ? nextPage : null,
        currentRoute: '/'
    });

    }catch(error) {
        console.log(error);
    }
});


/* Sauvegarde du modèle de route simple, avant mise en place de la pagination
router.get('', async(req, res) => {

    const locals = {
        title: "Pet's Friends",
        description:"Simple Blog created with NodeJs, Express & MongoDb."
    }
    try {
        const data = await Post.find();
        res.render('index', { locals, data });
    }catch(error) {
        console.log(error);
    }
});*/

/**
 * GET /
 * Post : id
 */

router.get('/post/:id', async(req, res) => {
  
    try {

        let slug = req.params.id;

        const data = await Post.findById({_id: slug});
        
        const locals = {
            title: data.title,
            description:"Simple Blog created with NodeJs, Express & MongoDb."
        }

        res.render('post', { 
            locals, 
            data,
            currentRoute: `/post/${slug}` 
        });
    }catch(error) {
        console.log(error);
    }
});

/**
 * POST /
 * Post : id
 */

router.post('/search', async(req, res) => {

    try {
        const locals = {
            title: "Search",
            description:"Simple Blog created with NodeJs, Express & MongoDb."
        }

        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g,"")

        const data = await Post.find({
            $or: [
                {title: { $regex: new RegExp(searchNoSpecialChar,'i')}},
                {body: { $regex: new RegExp(searchNoSpecialChar,'i')}}
            ]
        });

        res.render("search", {
            data,
            locals
        });

    }catch(error) {
        console.log(error);
    }
});
router.get('/about', (req, res) => {
    res.render('about', {currentRoute: '/about'});
});
router.get('/contact', (req, res) => {
    res.render('contact', {currentRoute: '/contact'});
});
/*
Insertion de données dans la base pour test

function instertPostData () {
    Post.insertMany([
        {
            title: "Love My dog",
            body: "This is the body text"
        },
        {
            title: "Feed my dog",
            body: "This is the body text"
        },
        {
            title: "Walk with my dog",
            body: "This is the body text"
        },
        {
            title: "Chill with my dog",
            body: "This is the body text"
        },
    ])
};
instertPostData();
*/
module.exports = router;