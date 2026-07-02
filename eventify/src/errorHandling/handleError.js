export const handleError = (err, context) => {
  if (err.response) {
    console.error(`${context} — Server Error:`, err.response.status, err.response.data);
    throw new Error(`Server error: ${err.response.status}`);
  } else if (err.request) {
    console.error(`${context} — No Response (server down or wrong IP)`);
    throw new Error('No response from server');
  } else {
    console.error(`${context} — Request Setup Error:`, err.message);
    throw new Error(err.message);
  }
};