const path = require('path');
const dotenv = require('dotenv');

class Config {
  constructor () {
    this.root = path.normalize(path.join(__dirname, '/..'));
    this.rootPath = process.env.ROOT_PATH || '/';
    this.port = parseInt(process.env.PORT) || 3000;
    this.env = process.env.NODE_ENV || 'production';
    this.server_cache = process.env.SERVER_CACHE || true;
    this.server_watch = process.env.SERVER_WATCH || false;
    this.site_url = process.env.SITE_URL || 'localhost';
  }
}

dotenv.config({
  path: path.join(__dirname, '../.env')
});

const config = new Config();

module.exports = config;
