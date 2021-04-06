// module.exports = app => {
//     app.route('/contact/all').get(Contact.all);
//     /**
//      * Create the remaining routes
//      * get,
//      * create,
//      * delete,
//      * update,
//      * remove
//      */
// };


require('../utils/passport');
import express from 'express';
import passport from 'passport';
import Contact from '../controllers/contact';
/**
 *
 *
 */
const contactRouter = express.Router();
const authenticate = passport.authenticate('jwt', { session: false });
contactRouter.get('/all', authenticate, Contact.all);
contactRouter.get('/:id', authenticate, Contact.get);
contactRouter.post('', authenticate, Contact.create);
contactRouter.put('/:id', authenticate, Contact.update);
contactRouter.delete('/:id', authenticate, Contact.remove);

export default contactRouter;


/* export default {
    // get all contacts for a user
    all,
    // get a single contact
    get,
    // create a single contact
    create,
    // update a single contact
    update,
    // remove a single contact
    remove
} */