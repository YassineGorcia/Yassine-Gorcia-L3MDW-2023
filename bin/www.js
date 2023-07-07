


const app = require('../app');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();



/**
 * Listen on provided port, on all network interfaces.
 */

mongoose.connect(process.env.MONGODB_URL).then(() => {
  console.log(`mongodb connected ${process.env.MONGODB_URL}`)
}).catch(err => {
  console.log(err);
  process.exit(1);
});



