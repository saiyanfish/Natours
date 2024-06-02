const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('uncaughtException!! Shutting down');
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

console.log(process.env.NODE_ENV);

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

// mongoose
//   .connect(DB, {
//     // useNewUrlParser: true,
//     // useCreateIndex: true,
//     // useFindAndModify: false,
//     // useUnifiedTopology: true,
//   })
//   .then(() => {
//     // console.log(con.connection);
//     console.log('DB STARTED CONNECTION');
//   })
mongoose.connect(DB).then(() => console.log('DB STARTED'));
const port = process.env.PORT || 3000;
const server = app.listen(3000, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('unhandledRejection!! Shutting down');
  server.close(() => {
    process.exit(1);
  });
});
