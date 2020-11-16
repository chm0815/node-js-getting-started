// TODO: change settings here!
const dbSettings =  {
    host: process.env.DBHOST || "localhost",
    user: process.env.DBUSER ||"el",
    password: process.env.DBPASSWORD || "1234",
    database: process.env.DBNAME ||"everyonelearns"
};

module.exports.dbSettings = dbSettings;
