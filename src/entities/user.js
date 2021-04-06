/* import mongoose, { Schema } from 'mongoose';
import bcrypt from 'mongoose-bcrypt';
import timestamps from 'mongoose-timestamp';
import mongooseStringQuery from 'mongoose-string-query';

export const UserSchema = new Schema(
	{
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
		}
	},
	{ collection: 'users' }
)

UserSchema.plugin(bcrypt);
UserSchema.plugin(timestamps);
UserSchema.plugin(mongooseStringQuery);

UserSchema.index({ email: 1, username: 1 });

module.exports = exports = mongoose.model('User', UserSchema);



 */



import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import Joi from '@hapi/joi';

const UserSchema = new Schema({

	tokens: [{ token: { type: String, required: true } }],

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
	}

}, { timestamps: true, collection: 'users' });

UserSchema.index({ email: 1, username: 1 });

UserSchema.methods.joiValidate = user => {
	const joiUserSchema = Joi.object({
		email: Joi.string().email().required(),
		name: Joi.string().min(6).max(30).required(),
		username: Joi.string().min(6).max(50).required(),
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

UserSchema.methods.JSON = function () {
	const { timestamps, password, tokens, ...publicProfile } = this.toObject();
	/* 	delete publicProfile.timestamps;
		delete publicProfile.password;
		delete publicProfile.tokens; */
	return publicProfile;
};

module.exports = mongoose.model('User', UserSchema);
