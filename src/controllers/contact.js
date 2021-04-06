/**
 * A simple CRUD controller for contacts
 * Create the necessary controller methods 
 */

export const all = (req, res) => {
    res.status(404).json({ err: "not implemented" })
};

export const get = (req, res) => {
    res.status(404).json({ err: "not implemented" })
};

export const create = (req, res) => {
    res.status(404).json({ err: "not implemented" })
};

export const update = (req, res) => {
    res.status(404).json({ err: "not implemented" })
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