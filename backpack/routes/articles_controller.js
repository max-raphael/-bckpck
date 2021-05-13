// Set up required files and configurations
let express = require('express');
let router = express.Router();
require('dotenv').config()
let knex = require('../models/db')

// Get all articles, categories, and websites to render articles page and dropdown filter menu
router.get('/', (req, res) => {
    knex('articles')
        .then(articles => {
            knex('articles')
                // Get categories for articles that currently exist and exclude those that have been deleted from populating the dropdown menus
                .join('categories_articles', 'articles.id', 'categories_articles.article_id')
                .join('categories', 'categories.id', 'categories_articles.category_id')
                .distinct('category')
                .then(categories => {
                    knex('articles')
                        // Get websites for articles that currently exist and exclude those that have been deleted from populating the dropdown menus
                        .join('websites', 'articles.website_id', 'websites.id')
                        .distinct('website')
                        .then(websites => {
                            res.json(articles, categories, websites)
                        })
                })
        })
})

// Get articles by category and/or website

// Post article

// Update category or title of article with id == req.params.id

// Delete article

module.exports = router;
