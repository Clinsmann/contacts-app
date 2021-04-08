import express from 'express';
import passport from 'passport';
import Contact from '../controllers/contact';

const contactRouter = express.Router();
const authenticate = passport.authenticate('jwt', { session: false });
contactRouter.get('/all', authenticate, Contact.all); // get all contacts for a user
contactRouter.get('/:id', authenticate, Contact.get); // get a single contact for a user
contactRouter.post('', authenticate, Contact.create); // create a single contact for a user
contactRouter.put('/:id', authenticate, Contact.update); // update a single contact for a user
contactRouter.delete('/:id', authenticate, Contact.remove); // remove a single contact for a user

export default contactRouter;
