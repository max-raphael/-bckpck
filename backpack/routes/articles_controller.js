// Set up required files and configurations
let express = require('express');
let router = express.Router();
require('dotenv').config()
let knex = require('../models/db')

// Get all articles, categories, and websites to render articles page and dropdown filter menu

// Get articles by category and/or website

// Post article

// Update category or title of article with id == req.params.id

// Delete article

module.exports = router;
