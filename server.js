const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err =>{
  console.log(err.name, err.message);
  console.log('UNHANDLED Exception Shutting down');
    process.exit(1);

});
dotenv.config({path: './config.env'});
const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);

mongoose.connect(DB,{
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(con=>{
  console.log("Done");
});





const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log('App Running in port 3000');
});

// server.close() would stop the server, but not the app so if you had other code running then it'd still be executed.
// process.exit() stops the process completely which stops everything.
process.on('unhandledRejection', err =>{
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION Shutting down');
  server.close(()=>{
    process.exit(1);
  })
});

