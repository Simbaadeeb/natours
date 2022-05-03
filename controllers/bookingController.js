const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Tour = require('../models/tourModel')
const Booking = require('../models/bookingModel')
const APIFeatures = require('../utils/apiFeatures')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')

exports.getCheckoutSession = catchAsync( async (req, res, next) => {
    // 1) Get the currenty booked tour
    const tour = await Tour.findById(req.params.tourId)

    // 2) Create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [{
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: ['https://img.arirang.com/A_UpFile/Template/TP170927111345_A1.png'],
            amount: tour.price * 100,
            currency: 'usd',
            quantity: 1
        }]
    })
    
    // 3 Create session as response
    res.status(200).json({
        status: 'success',
        session
    })

})

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    // This is ony tempirary because it is unsecure
    const {tour, user, price} = req.query
    
    if(!tour && !user && !price) return next()

    await Booking.create({tour, user, price})

    res.redirect(req.originalUrl.split('?')[0])
})

exports.createBooking = factory.createOne(Booking)
exports.getBooking = factory.getOne(Booking)
exports.getAllBookings = factory.getAll(Booking)
exports.updateBooking = factory.updateOne(Booking)
exports.deleteBooking = factory.deleteOne(Booking)