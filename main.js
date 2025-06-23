const { Client } = require('pg');

const con = new Client({
    host: 'localhost',
    user: 'postgres',
    port: 5432,
    password: "Kjc11212006*",
    database: 'postgres'
})

con.connect().then(() => console.log('Connection success'))

con.query('SELECT * FROM get_all_players()', (err, result) => {
    if (err) {
        console.error('Error running query', err);
    } else {
        console.log(result.rows);
    }
    con.end(); // Close connection after query
});
