// Update with your config settings.
//

module.exports = {  
    client: 'pg',
    connection: {
      //database: 'knowledge',
      //user:     'postgres',
      //password: '2611rs'      
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  

};
