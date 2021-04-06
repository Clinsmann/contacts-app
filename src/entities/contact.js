import mongoose, { Schema } from 'mongoose';
import Joi from '@hapi/joi';

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
  address: String
}, { timestamps: true, collection: 'contacts' });

ContactSchema.index({ phone: 1, name: 1 });

ContactSchema.methods.joiValidate = contact => {
  const joiContactSchema = Joi.object({
    address: Joi.string().max(100),
    name: Joi.string().min(2).max(50).required(),
    phone: Joi.string().min(11).max(14).required(),
  }).options({ abortEarly: false });
  return joiContactSchema.validate(contact);
};

export default mongoose.model('Contact', ContactSchema);