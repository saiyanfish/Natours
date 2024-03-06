const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./userModel');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal 40 charactors'],
      minlength: [5, 'A tour name must have more or equal 10 charactors'],
      // validate: [validator.isAlpha, 'Tour name must only contain charactors'],
    },
    slug: String,
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      maxlength: [5, 'Rating must be below 5'],
      minlength: [1, 'Rating must be above 1'],
      set: (el) => Math.round(el * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // This only points to current doc on new Document creation
          return val < this.price;
        },
        message: 'PriceDiscount must be below price',
      },
    },
    summary: {
      type: String,
      trim: true,
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either : easy, medium ,difficult level',
      },
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guides: Array, //embedded
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    // reviews: [{ type: mongoose.Schema.ObjectId, ref: 'Review' }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// Document Middleware : runs before , .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v',
  });
  next();
});

// tourSchema.pre('save', function (next) {
//   console.log('will save docs');
//   next();
// });

// tourSchema.post('save', (doc, next) => {
//   console.log(doc);
//   next();
// });

// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (el) => User.findById(el));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// Query middleware
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});
// tourSchema.post(/^find/, function (doc, next) {
//   console.log(`Query took ${Date.now() - this.start} ms`);
//   console.log(doc);
//   next();
// });

// Aggregation middleware
tourSchema.pre('aggregate', function (next) {
  // const hasGeoNearStage = this.pipeline().some(
  //   (stage) => stage.$geoNear !== undefined,
  // );
  const hasGeoNearStage = this.pipeline()[0].$geoNear !== undefined;
  if (!hasGeoNearStage) {
    console.log('!geoNear');
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  }
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
