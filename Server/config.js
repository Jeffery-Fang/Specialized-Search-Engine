let config = {};
config.db = {};

const password = 'zJGFqoXxxXAlUgnp';
const dbname = 'COMP4601A1';

const connectionURL = `mongodb+srv://COMP4601A1:${password}@cluster0.neemamb.mongodb.net/?retryWrites=true&w=majority`

config.db.host = connectionURL;
config.db.name = dbname;

module.exports = config;