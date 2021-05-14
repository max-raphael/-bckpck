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

// This helper function is used by subsequent GET w/ Filters routes. Both end paths of an if-else statement
// need the knex code in this function, but because of asynchronous properties, I cannot simply stick it after
// the if-else code block completes
function getHelper(output, req, res) {
    knex('categories')
        .join('categories_articles', 'categories.id', 'categories_articles.category_id')
        .distinct('category')
        .then(categories => {
            knex('websites')
                .join('articles', 'articles.website_id', 'websites.id')
                .distinct('website')
                .then(websites => {
                    res.json(output, categories, websites)
                })
        })
}

// Get articles by category and/or website
router.get('/filter/', (req, res) => {
    // Final array that stores all articles that match the provided filters
    output = []

    // If no filters are selected, clicking Filter sends the user back to all of their unfiltered articles
    if (req.query.category == undefined && req.query.website == undefined) {
        return res.redirect('/articles')
    }

    // The following is a series of paths dependent on whether category, website, or both were selected by the user when filtering
    if (req.query.category != undefined) {
        // If a category is selected, we go to the categories table and retreive the appropriate category_id
        knex('categories')
            .where('category', req.query.category)
            .first()
            .then(category => { // category contains id and category name
                knex('categories_articles') 
                // next, we go to the categories_articles join table and retrieve all entires with the matching category_id
                .where('categories_articles.category_id', category.id)
                .then(async (entries) => { // entries contains array of articles with matching category id
                    // If the user selected a website to filter by, we next retrieve all articles that have the matching website id
                    if (req.query.website != undefined){
                        await knex('websites') 
                            .join('articles', 'websites.id', '=', 'articles.website_id')
                            .where('websites.website', req.query.website)
                            .first()
                            .then(async website => {
                                // Finally, we go through every entry with a matching cateogry_id and see if that article has the matching website id, and push into output
                                for (entry of entries) {
                                    await knex('articles')
                                        .where('articles.id', entry.article_id)
                                        .where('articles.website_id', website.website_id)
                                        .first()
                                        .then(article => {
                                            if (article != undefined) {
                                                output.push(article)
                                            }
                                        })
                                }
                            })
                        .then(() => {
                            return getHelper(output, req, res)
                        })
                    } else {
                        // If no website was selected, we display all articles with matching category id
                        req.website = '';
                        for (entry of entries) {
                            await knex('articles')
                            .where('articles.id', entry.article_id)
                            .first()
                            .then(article => {
                                if (article != undefined) {
                                    output.push(article)
                                }
                            })
                        }
                        return getHelper(output, req, res)
                    }

                })

            })
    } else {
        if (req.query.website != undefined)
        // If no category is selected but a website is, then we first join the websites table with the articles table 
        // so that we can then filter to all of the articles that are from the selected website
        knex('websites')
            .join('articles', 'websites.id', 'articles.website_id')
            .where('websites.website', req.query.website)
            .then(output => {
                return getHelper(output, req, res)
            })
    }
})

// POST helpers

// This function finds the second level domain (SLD) of a website
function extractSLD(url) {
    let indexOfFirstPeriod = (url).indexOf(".")
    let urlMinusStart = (url).substring(indexOfFirstPeriod + 1)
    let indexOfSecondPeriod = (urlMinusStart.substring(0, url.length -1)).indexOf(".")
    if (indexOfSecondPeriod == -1) {
        // Covers case where no subdomain ("www") is included
        let indexOfSlash = (url).indexOf("/")
        return url.substring(indexOfSlash + 2, indexOfFirstPeriod)
    }
    return urlMinusStart.substring(0, indexOfSecondPeriod)
}

function postHelper(res, categoryId, retrievedArticle) {
    knex('categories_articles')
        .insert( { category_id: categoryId, article_id: retrievedArticle.id } )
        .then(() => {
            return res.redirect('/articles')
        })
}

// POST REQUESTS
// title, url, author, imageUrl passed in req.body
router.post('/', async (req, res) => {
    let extractedWebsite = extractSLD(req.body.url)
    req.body.title = req.body.title.trim()
    req.body.category = req.body.category.trim()

    knex('articles')
        .where('articles.url', req.body.url)
        .then((articleCheck) => {
            // Check if article already exists
            if (articleCheck.lentgh > 0) {
                return res.redirect('/articles')
            } else {
                knex('websites')
                    .where('website', extractedWebsite)
                    .then(async (websiteResponse) => {
                        // insert website if it hasn't been already
                        if (websiteResponse[0] == undefined) {
                            await knex('websites')
                                .insert({website: extractedWebsite})
                        }
                        knex('websites')
                            .where('website', extractedWebsite)
                            .first()
                            .then((returnedWebsite) => {
                                knex('articles')
                                    // insert new data into articles table
                                    .insert({title: req.body.title, url: req.body.url, website_id: returnedWebsite.id, author: req.body.author, image: req.body.imageUrl})
                                    .then(() => {
                                        knex('articles')
                                            .where('title', req.body.title)
                                            .first()
                                            .then(async (retrievedArticle) => {
                                                let categoryId = -1 // placeholder
                                                // If the user supplied a category
                                                if (req.body.category != '') {
                                                    await knex('categories')
                                                        .where('category', req.body.category)
                                                        .first()
                                                        // store category id to insert in join table and possibly insert into category table if necessary
                                                        .then(async (category) => {
                                                            // if that category already exists, set category to that ID. Otherwise, insert it
                                                            if (category != undefined) {
                                                                categoryId = category.id
                                                                return postHelper(res, categoryId, retrievedArticle)
                                                            } else {
                                                                await knex('categories') 
                                                                    .insert({ category: req.body.category}, '*')
                                                                    .then(async (insertedCategory) => {
                                                                        categoryId = insertedCategory[0].id;
                                                                        return postHelper(res, categoryId, retrievedArticle)
                                                                    })
                                                            }
                                                        })
                                                // If the user didn't supply a category, repeat the same process as above but with the default category 'Not categorized'
                                                // This normally would be a function called above and here again, but knex is not compatible with functions in this way
                                                } else {
                                                    await knex('categories')
                                                        .where('category', 'Not categories')
                                                        .first()
                                                        .then(async (category) => {
                                                            if (category != undefined) {
                                                                categoryId = category.id
                                                                return postHelper(res, categoryId, retrievedArticle)
                                                            } else {
                                                                await knex('categories')
                                                                    .insert({category: 'Not categorized'}, '*')
                                                                    .then(async (insertedCategory) => {
                                                                        categoryId = insertedCategory[0].id;
                                                                        return postHelper(res, categoryId, retrievedArticle)
                                                                    })
                                                            }
                                                        })
                                                }
                                            })
                                    })
                            })
                    })
            }
        })
})

// edit category for given article
function asyncHelper(categoryId, req, res) {
    knex('categories_articles')
        .update('category_id', categoryId)
        .where('categories_articles.article_id', req.params.id)
        .then(() => {
            return res.redirect('/articles')
        })
}

// Updates title of matching article id
function updateHelper(req, res) {
    knex('articles') 
        .update('title', req.body.title, '*')
        .where('id', req.params.id)
        .then(() => {
            knex('categories')
                .where('category', req.body.category)
                .first()
                .then(async selectedCategory => {
                    categoryId = -1 // placeholder value for categoryId
                    if (selectedCategory == undefined) {
                        // if that category doesn't exist, insert it and update categoryId with asyncHelper
                        await knex('categories')
                            .insert({ category: req.body.category }, '*')
                            .then(insertedCategory => {
                                categoryId = insertedCategory[0].id
                            })
                            .then(() => {
                                return asyncHelper(categoryId, req, res)
                            })
                    } else { // else just update categoryId
                        categoryId = selectedCategory.id
                        return asyncHelper(categoryId, req, res)
                    }
                })
        })
}

// update category or title of article with id == req.params.id
router.put('/:id', async(req, res) => {
    req.body.title = req.body.title.trim()
    req.body.category = req.body.category.trim()
    if (req.body.category == '') { // category is unchanged
        await knex('categories_articles')
        .first()
        .then((grabCategoryId) => {
            knex('categories')
                .where('id', grabCategoryId.id)
                .first()
                .then(grabCategory => {
                    req.body.category = grabCategory.category; // set it back to its category because user left unchanged
                })
                .then(() => {
                    return updateHelper(req, res)
                })
        })
    } else {
        return updateHelper(req, res)
    }
})

// Delete article
router.delete('/:id', (req, res) => {
    knex('articles')
        .where('id', req.params.id)
        .del()
        .then(result => {
            res.json(result)
        })
})

module.exports = router;
