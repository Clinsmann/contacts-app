import Contact from '../entities/contact';
import logger from '../utils/logger';
import HttpStatus from 'http-status-codes';
/**
 * A simple CRUD controller for contacts
 * Create the necessary controller methods 
 */

export const all = async (req, res) => {
  try {
    res.json({ contacts: await Contact.find({}) });
  } catch (error) {
    logger.error(error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Error has occurred' });
  }
};

export const get = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (contact) res.json({ contact });
    res.status(HttpStatus.NOT_FOUND).json({ contact })
  } catch (error) {
    logger.error(error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Error has occurred' });
  }
};

export const create = (req, res) => {
  const { phone, name, address } = req.body;
  Contact.findOne({ name }, (error, contact) => {
    if (error) {
      logger.error(error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
    }
    else if (contact) {
      res.status(HttpStatus.CONFLICT).json({ error: 'Contact already exist. Change name and try again!' });
    }
    else {
      const contactData = { phone, name, address };
      const newContact = new Contact(contactData);
      var { error: validationError } = newContact.joiValidate(contactData);
      if (validationError) {
        logger.error(validationError.details);
        return res.status(HttpStatus.BAD_REQUEST).json({ error: validationError.details });
      }
      newContact.save(createEntityError => {
        if (createEntityError) {
          logger.error(createEntityError);
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: createEntityError });
        }
        else res.status(HttpStatus.OK).json({ contact: newContact });
      })
    }
  });
};

export const update = async (req, res) => {
  const { id } = req.params;
  const { phone, name, address } = req.body;
  const contact = await Contact.findOne({ name: req.body.name });
  if (contact && (contact.id !== id)) {
    res.status(HttpStatus.CONFLICT).json({ error: 'Contact already exist. Change name and try again!' });
  }
  else {
    const contactData = { phone, name, address };
    const newContact = new Contact(contactData);
    var { error: validationError } = newContact.joiValidate(contactData);
    console.log({ validationError })
    if (validationError) {
      logger.error(validationError.details);
      return res.status(HttpStatus.BAD_REQUEST).json({ error: validationError.details });
    }

    Contact.updateOne({ _id: id }, req.body, async (err) => {
      if (err) res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Error has occurred' });
      else res.status(HttpStatus.OK).json({ contact: await Contact.findById(id) });
    });
  }
};

export const remove = (req, res) => {
  res.status(404).json({ err: "not implemented" })
};

export default {
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
}