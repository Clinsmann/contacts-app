import Joi from '@hapi/joi';
import bcrypt from 'bcryptjs';
import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  email: {
    type: String,
    lowercase: true,
    trim: true,
    index: true,
    unique: true,
    required: true
  },
  username: {
    type: String,
    lowercase: true,
    trim: true,
    index: true,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true,
    bcrypt: true
  },
  name: {
    type: String,
    trim: true,
    required: true
  },
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contact' }],

}, { timestamps: true, collection: 'users' });

UserSchema.index({ email: 1, username: 1 });

UserSchema.methods.joiValidate = user => {
  const joiUserSchema = Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().min(6).max(30).required(),
    username: Joi.string().min(2).max(50).required(),
    password: Joi.string().min(6).max(30).regex(/[a-zA-Z0-9]{3,30}/).required(),
  }).options({ abortEarly: false });
  return joiUserSchema.validate(user);
};

UserSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();
  bcrypt.hash(this.password, 10, (err, passwordHash) => {
    if (err) return next(err);
    this.password = passwordHash;
    next();
  })
});

UserSchema.methods.comparePassword = function (password, cb) {
  bcrypt.compare(password, this.password, (err, isMatch) => {
    if (err) return cb(err);
    else if (!isMatch) return cb(null, isMatch);
    else return cb(null, this);
  })
};

module.exports = mongoose.model('User', UserSchema);
