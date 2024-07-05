require('dotenv').config();

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { MongoClient } = require('mongodb');
const Dropbox = require('dropbox').Dropbox;

const app = express();
const PORT = process.env.PORT || 5000;

/* Connect to MongoDB Atlas */
const connectDB = async () => {
    try {
        const client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        console.log('Connected to MongoDB Atlas');
        return client;
    } catch (error) {
        console.error('Error connecting to MongoDB Atlas:', error);
    }
};

const dbClient = connectDB();

/* Middleware */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    }),
}));
app.use(express.static('public'));
app.use(expressLayouts);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

/* Configuration de l'API Dropbox */
const dbx = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN });

/* Configuration de Multer */
const upload = multer({ dest: 'uploads/' });

/* Routes */
app.get('/', (req, res) => {
    res.render('index', { title: "Home" });
});

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        const fileContent = fs.readFileSync(file.path);

        const uploadedFile = await dbx.filesUpload({
            path: `/${file.originalname}`,
            contents: fileContent
        });

        // Supprimer le fichier temporaire après l'upload
        fs.unlinkSync(file.path);

        res.send('File uploaded to Dropbox!');
    } catch (error) {
        console.error('Error uploading file to Dropbox:', error);
        res.status(500).send('Error uploading file to Dropbox');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
