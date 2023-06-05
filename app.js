    const path = require('path');
    const express = require('express'); // hena ana b3ml import ll express
    const morgan = require('morgan');
    const tourRouter = require('./routes/tourRoutes'); // b3ml import ll tour module eli ana 3amlto
    const UserRouter = require('./routes/userRoutes');
    const reviewRouter = require('./routes/reviewRoutes');
    const viewRouter = require('./routes/viewRoutes');
    const { Error } = require('mongoose'); // b3ml import ll user module eli ana 3amlto
    const AppError = require('./utils/AppError');
    const globalErrorhandler = require('./Controller/errorController');
    const rateLimit = require('express-rate-limit');
    const helmet = require('helmet');
    const mongoSanitize = require('express-mongo-sanitize');
    const xss = require('xss-clean');
    const hpp = require('hpp');

    const app = express();

    app.set('view engine', 'pug');
    app.set('views', path.join(__dirname, 'views'));

    app.use(helmet());
    app.use(express.json({limit: '10kb'}));

    //  "email": {"$gt": ""},
    // The purpose of mongoSanitize() is to prevent MongoDB injection attack
    // s by removing any characters that could be used to create malicious MongoDB queries.
    // For example, if a user tries to inject a $ character into a query,
    // mongoSanitize() will remove it, thus preventing the injection attack.
     app.use(mongoSanitize());


     // app.use(xss()) is a middleware function used in Node.js and Express.js
    // applications to prevent Cross-Site Scripting (XSS) attacks. It does this by
    // filtering the user input and escaping any characters that could be used to inject
    // malicious code into a web page.
    // example html code
    app.use(xss());

    // Prevent parameter pollution
    app.use(
      hpp({
          whitelist: [
              'duration',
              'ratingsQuantity',
              'ratingsAverage',
              'maxGroupSize',
              'difficulty',
              'price'
          ]
      })
    );


    app.use(morgan('dev'));

    app.use(express.static(path.join(__dirname, 'public')));

    app.use((req,res,next)=>{
      req.requestTime = new Date().toISOString();
      next();
    });


const limiter = rateLimit({
    max : 100,
    windowMs: 60 * 60* 100,
    message: "To many requests ya man"
});


app.use('/api',limiter);


    // Mounting Router


    app.use('/',viewRouter)
    app.use('/api/v1/tours',tourRouter);
    app.use('/api/v1/users',UserRouter);
    app.use('/api/v1/reviews',reviewRouter);


    app.all('*',(req,res,next)=>{

       next(new AppError(`Can't find ${req.originalUrl} on this server`,404))


    })

    app.use(globalErrorhandler);


    module.exports = app;


    // So now the request-response path will be as follow:
    //
    // Request sent to server
    //
    //      -> server.js
    //
    //           -> app.js (res and req object go through all the middlewares)
    //
    //                -> routes (depends on the path, handled by respective router - userRoutes/tourRoutes)
    //
    //                     -> controllers (depend on which HTTP method, handled by respective controllers - userControllers/tourControllers)
    //
    //                          -> END of the request-response flow