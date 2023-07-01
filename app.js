    const path = require('path');
    const express = require('express'); // hena ana b3ml import ll express
    const morgan = require('morgan');
    const tourRouter = require('./routes/tourRoutes'); // b3ml import ll tour module eli ana 3amlto
    const UserRouter = require('./routes/userRoutes');
    const reviewRouter = require('./routes/reviewRoutes');
    const viewRouter = require('./routes/viewRoutes');
    const bookingRouter = require('./routes/bookingRoutes');
    const { Error } = require('mongoose'); // b3ml import ll user module eli ana 3amlto
    const AppError = require('./utils/AppError');
    const globalErrorhandler = require('./Controller/errorController');
    const rateLimit = require('express-rate-limit');
    const helmet = require('helmet');
    const mongoSanitize = require('express-mongo-sanitize');
    const xss = require('xss-clean');
    const cookieParser = require('cookie-parser')
    const hpp = require('hpp');

    const app = express();

    const logRequest = (req, res, next) => {
        console.log('Received a request:');
        console.log('Method:', req.method);
        console.log('URL:', req.url);
        console.log('Headers:', req.headers);
        console.log('Body:', req.body);
        next(); // Move to the next middleware or route handler
    };

    const logResponse = (req, res, next) => {
        // Save the original 'res.send' method
        console.log("respoooonse");
        const originalSend = res.send;

        // Override 'res.send' to log the response details
        res.send = function (body) {
            console.log('Sent a response:');
            console.log('Status:', res.statusCode);
            console.log('Headers:', res.getHeaders());
            console.log('Body:', body);
            originalSend.apply(res, arguments); // Call the original 'res.send' method
        };

        next(); // Move to the next middleware or route handler
    };

    app.set('view engine', 'pug');
    app.set('views', path.join(__dirname, 'views'));

    app.use(
      helmet.contentSecurityPolicy({
          directives: {
              defaultSrc: ["'self'", 'data:', 'blob:'],
              baseUri: ["'self'"],
              fontSrc: ["'self'", 'https:', 'data:'],
              // scriptSrc: ["'self'", 'https://*.cloudflare.com'],
              // scriptSrc: ["'self'", 'https://*.stripe.com'],
              scriptSrc: ["'self'", 'https://*.mapbox.com'],
              frameSrc: ["'self'", 'https://*.stripe.com'],
              objectSrc: ["'none'"],
              styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
              workerSrc: ["'self'", 'data:', 'blob:'],
              childSrc: ["'self'", 'blob:'],
              imgSrc: ["'self'", 'data:', 'blob:'],
              connectSrc: ["'self'", 'blob:', 'https://*.mapbox.com'],
              upgradeInsecureRequests: [],
          },
      })
    );

    // app.use(helmet());














    app.use(express.json({limit: '10kb'}));
    app.use(express.urlencoded({extended:true,limit: '10kb'}))
    app.use(cookieParser());
    // app.use(logRequest);
    // app.use(logResponse);


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
    app.use('/api/v1/bookings', bookingRouter);


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