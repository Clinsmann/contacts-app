import User from '../entities/user';
import logger from '../utils/logger';

const JWT = require('jsonwebtoken');

import { errorMessage, successMessage } from '../utils/response';

const JWT_SECRET = 'CLINSMANN_AFRICHORAL_WEB_APPLICATION';

const signToken = user => (JWT.sign(
	{ iss: process.env.JWT_SECRET, sub: user._id, user },
	// process.env.JWT_SECRET,
	JWT_SECRET,
	{ expiresIn: "30 day" }
));

/**
 * Given a json request 
 * {"username": "<...>", "password": "<...>"}
 * Verify the user is valid and return some authentication token
 * which can be used to verify protected resources
 * {"user": <{...}>, "token": "<...>""}
 */
export const login = (req, res) => {
	if (req.isAuthenticated()) {
		const user = {
			_id: req.user._id,
			name: req.user.name,
			email: req.user.email,
			username: req.user.username
		}
		const token = signToken(user);
		res.status(200).json({ user, token });
	}
};

/**
 * Given a json request 
 * {"username": "<...>", "password": "<...>"}
 * Create a new user and return some authentication token 
 * which can be used to verify protected resources
 * {"user": <{...}>, "token": "<...>""}
 */
export const signup = (req, res) => {
	const { email, password, name, username } = req.body;
	User.findOne({ email }, (err, user) => {
		if (err) res.status(500).json(errorMessage(err));
		else if (user) res.status(409).json(errorMessage('Email already exist'));
		else {
			const user = { email, password, name, username };
			const newUser = new User(userData);
			var { error } = newUser.joiValidate(userData);
			if (error) return res.status(400).json(errorMessage(error.details));
			newUser.save(err => {
				if (err) res.status(500).json(errorMessage(err));
				else res.status(201).json({
					user,
					token: signToken({ ...userData, _id: newUser._id })
				});
			})
		}
	});
};

/**
 * Implement a way to recover user accounts
 */
export const forgotPassword = (req, res) => {
	res.status(404).json({ err: "not implemented" })
};

export default {
	login,
	signup,
	forgotPassword
}