import User from '../entities/user';
import logger from '../utils/logger';
import Contact from '../entities/contact';
import { StatusCodes } from 'http-status-codes';
/**
 * A simple CRUD controller for contacts
 * Create the necessary controller methods 
 */

export const all = async (req, res) => {
  try {
    const { contacts } = await User.findById(req.user.id).populate('contacts').exec();
    res.json({ contacts });
  } catch (error) {
    logger.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
};

export const get = async (req, res) => {
  try {
    const contact = await Contact.findOne({ createdBy: req.user.id, _id: req.params.id });
    if (!contact) return res.status(StatusCodes.NOT_FOUND).json({ error: 'Contact not found' });

    res.json({ contact });
  } catch (error) {
    logger.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
};

export const create = async (req, res) => {
  const { phone, name, address } = req.body;
  const data = { phone, name, address, createdBy: req.user.id };

  try {
    const { contact, isValid } = validate(data, res);
    if (!isValid || await isDuplicate(data, res, 'create')) return;

    await contact.save();
    req.user.contacts.push(contact);
    await req.user.save();

    res.status(StatusCodes.CREATED).json({ contact });
  } catch (error) {
    logger.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
};

export const update = async (req, res) => {
  const { id } = req.params;
  const { phone, name, address } = req.body;
  const data = { phone, name, address, createdBy: req.user.id };

  try {
    if (!validate(data, res).isValid || await isDuplicate({ ...data, id }, res, 'update')) return;

    const contact = await Contact.findByIdAndUpdate(id, data);
    if (!contact) return res.status(StatusCodes.NOT_FOUND).json({ error: 'Contact not found' });

    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    logger.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
};

export const remove = async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!contact) return res.status(StatusCodes.NOT_FOUND).json({ error: 'Contact not found' });

    res.status(StatusCodes.OK).json({ contact, message: "Contact deleted" });
  } catch (error) {
    logger.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
  }
};

const validate = (data, res) => {
  const contact = new Contact(data);
  var { error } = contact.joiValidate(data);
  if (error) {
    logger.error(error);
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.details });
    return { isValid: false, contact: null }
  }
  return { isValid: true, contact };
};

const isDuplicate = async ({ name, createdBy, id }, res, type) => {
  try {
    const contact = await Contact.findOne({ name, createdBy });
    if (contact && ((type === 'create') || type === 'update' && (contact.id !== id))) {
      res.status(StatusCodes.CONFLICT).json({ error: 'Contact name already exist.' });
      return true;
    }
    return false;
  } catch (error) {
    logger.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error });
    return true;
  }
};

export default {
  all,// get all contacts for a user
  get,// get a single contact
  create,// create a single contact
  update,// update a single contact
  remove// remove a single contact
}
