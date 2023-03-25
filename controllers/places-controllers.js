const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const fs = require("fs");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../utils/location");
const Place = require("../models/place");
const User = require("../models/user");
const fileDelete = require("../utils/file-delete");

const getAllPlaces = async (req, res, next) => {
  let places;

  try {
    places = await Place.find({});
  } catch (err) {
    const error = new HttpError(
      "Fetching places failed, please try again later.",
      500
    );
    return next(error);
  }
  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
};

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(
      new HttpError("Could not fetch place for the provided ID", 500)
    );
  }

  if (!place) {
    return next(
      new HttpError("Could not find a place for the provided ID", 404)
    );
  }

  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let userWithPlaces;

  try {
    userWithPlaces = await User.findById(userId).populate("places");
  } catch (err) {
    return next(
      new HttpError("Could not fetch places for the provided user ID", 500)
    );
  }

  if (!userWithPlaces) {
    return next(
      new HttpError("Could not find places for the provided user ID", 404)
    );
  }

  res.json({
    places: userWithPlaces.places.map((place) =>
      place.toObject({ getters: true })
    ),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  let user;

  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    return next(new HttpError("Creating place failed, please try again", 500));
  }

  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description, address } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const placeToCreate = new Place({
    title,
    description,
    image: req.file.location,
    address,
    location: coordinates,
    creatorName: user.name,
    creatorImage: user.image,
    likes: [],
    comments: [],
    creator: req.userData.userId,
  });

  if (!user) {
    return next(new HttpError("Could not find user for provided id", 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await placeToCreate.save({ session: sess });
    user.places.push(placeToCreate);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("Creating place failed, please try again", 500));
  }

  res.status(201).json({ place: placeToCreate });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description } = req.body;

  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(
      new HttpError("Could not update place with the provided ID", 500)
    );
  }

  if (place.creator.toString() !== req.userData.userId) {
    return next(new HttpError("You are not allowed to edit this place", 401));
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    return next(
      new HttpError("Could not update place with the provided ID", 500)
    );
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (err) {
    return next(
      new HttpError("Could not delete place with the provided ID", 500)
    );
  }

  if (!place) {
    return next(
      new HttpError("Could not find a place with the provided ID", 404)
    );
  }

  if (place.creator.id !== req.userData.userId) {
    return next(new HttpError("You are not allowed to delete this place", 401));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(
      new HttpError("Could not update place with the provided ID", 500)
    );
  }

  const imagePath = place.image;
  fileDelete(imagePath);

  res.status(200).json({ message: "Deleted place" });
};

const handleLikeAdd = async (req, res, next) => {
  const placeId = await req.params.pid;
  let user = await req.userData.userId;
  let place;
  let isLiked;

  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(new HttpError("Creating place failed, please try again", 500));
  }

  try {
    if (place.likes.length > 0) {
      place.likes.map((like) => {
        if (req.userData.userId && like.toString() !== req.userData.userId) {
          isLiked = true;
          place.likes.push(user);
        } else {
          isLiked = false;
          place.likes.remove(user);
        }
      });
    } else {
      isLiked = true;
      place.likes.push(user);
    }

    await place.save();
  } catch (err) {}

  res
    .status(201)
    .json({ isLiked: isLiked, likesNumber: place.likes.length, user: user });
};

const createComment = async (req, res, next) => {
  const { comment } = req.body;
  let user = await req.userData.userId;
  const placeId = await req.params.pid;

  if (!comment || !user || !placeId) {
    return next(new HttpError("Comment is missing in request body", 400));
  }

  let place;

  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    return next(new HttpError("Creating place failed, please try again", 500));
  }

  let commentToCreate = {
    user: user.name,
    comment: comment,
    userId: user._id,
  };

  console.log(user._id)

  try {
    place = await Place.findById(placeId);
    place.comments.push(commentToCreate);
    await place.save();
  } catch (err) {
    return next(
      new HttpError("Comment creation failed, please try againnnn", 500)
    );
  }

  res.status(201).json({ place: place });
};

const deleteComment = async (req, res, next) => {
  const { comment } = req.body;
  let user = await req.userData.userId;
  const placeId = await req.params.pid;

  if (!comment || !user || !placeId) {
    return next(new HttpError("Comment removal failed", 400));
  }

  let place;

  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    return next(new HttpError("Comment removal failed", 500));
  }

  try {
    place = await Place.findById(placeId);

    if (!place) {
      throw new Error("Place not found");
    }

    place.comments.pull({ _id: comment });
    await place.save();
  } catch (err) {
    return next(new HttpError("Comment removal failed", 500));
  }

  res.status(200).json({ place: place });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
exports.getAllPlaces = getAllPlaces;
exports.handleLikeAdd = handleLikeAdd;
exports.createComment = createComment;
exports.deleteComment = deleteComment;
