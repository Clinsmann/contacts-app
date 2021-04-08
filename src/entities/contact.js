import Joi from '@hapi/joi';
import mongoose, { Schema } from 'mongoose';

const ContactSchema = new Schema({
  phone: {
    type: String,
    trim: true,
    index: true,
    required: true
  },
  name: {
    type: String,
    lowercase: true,
    trim: true,
    index: true,
    unique: true,
    required: true
  },
  address: {
    type: String,
    trim: true,
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true, collection: 'contacts' });

ContactSchema.index({ phone: 1, name: 1 });

ContactSchema.methods.joiValidate = contact => {
  const joiContactSchema = Joi.object({
    createdBy: Joi.required(),
    address: Joi.string().max(255),
    name: Joi.string().min(2).max(50).required(),
    phone: Joi.string().min(11).max(14).required(),
  }).options({ abortEarly: false });
  return joiContactSchema.validate(contact);
};

module.exports = mongoose.model('Contact', ContactSchema);
