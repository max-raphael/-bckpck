
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('articles').del()
    .then(function () {
      // Inserts seed entries
      return knex('articles').insert([
        {id: 1, title: 'Trumps Put Their Washington Hotel on the Market', url: 'https://www.nytimes.com/2019/10/25/us/politics/trump-hotel-washington.html', website_id: 1, author: 'Eric Lipton', image: 'https://static01.nyt.com/images/2019/10/25/us/politics/25dc-hotel/25dc-hotel-superJumbo.jpg?quality=90&auto=webp'},
        {id: 2, title: 'Trumps Put Their Washington Hotel on the Market', url: 'https://www.washingtonpost.com/weather/2019/10/25/how-powerful-winds-bone-dry-air-are-sparking-wildfire-nightmare-california/', website_id: 2, author: 'Matthew Capucci', image: 'https://www.washingtonpost.com/wp-apps/imrs.php?src=https://arc-anglerfish-washpost-prod-washpost.s3.amazonaws.com/public/TUG7I7HW3YI6TMWSD434TWBNXM.jpg&w=916'}
      ])
        .then(function () {
          return knex.raw(`SELECT setval('articles_id_seq', (SELECT MAX(id) FROM articles))`)
        })
    });
};
