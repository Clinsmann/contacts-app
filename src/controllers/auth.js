import JWT from 'jsonwebtoken';
import User from '../entities/user';
import logger from '../utils/logger';
const JWT_SECRET = 'CLINSMANN_AFRICHORAL_WEB_APPLICATION';

/**
 * Given a json request 
 * {"username": "<...>", "password": "<...>"}
 * Verify the user is valid and return some authentication token
 * which can be used to verify protected resources
 * {"user": <{...}>, "token": "<...>""}
 */
export const login = (req, res) => {
	if (req.isAuthenticated()) res.status(200).json(authResponse(req.user));
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
	User.findOne({ email }, (error, user) => {
		if (error) res.status(500).json({ error });
		else if (user) res.status(409).json({ error: 'Email already exist' });
		else {
			const user = { email, password, name, username };
			const newUser = new User(user);
			var { error: validationError } = newUser.joiValidate(user);
			if (validationError) return res.status(400).json({ error: validationError.details });
			newUser.save(createEntityError => {
				if (createEntityError) res.status(500).json({ error: createEntityError });
				else res.status(200).json(authResponse(newUser));
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

const signToken = user => (JWT.sign(
	{ iss: process.env.JWT_SECRET, sub: user._id, user },
	// process.env.JWT_SECRET,
	JWT_SECRET,
	{ expiresIn: "30 day" }
));

const authResponse = ({ _id, username, name, email }) => ({
	user: { _id, username, name, email },
	token: signToken(user),
});

export default {
	login,
	signup,
	forgotPassword
}