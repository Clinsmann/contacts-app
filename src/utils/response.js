export const errorMessage = body => ({ message: { body, error: true } });
export const responseMessage = (body, error) => ({ message: { body, error } });
export const successMessage = body => ({ message: { body, error: false } });
