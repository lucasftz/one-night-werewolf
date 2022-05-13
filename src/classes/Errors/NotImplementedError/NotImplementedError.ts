import BaseError from "../BaseError";

class NotImplementedError extends BaseError {
  constructor(
    description = "Sorry, this feature has not yet been implemented yet!"
  ) {
    super(description);
  }
}

export default NotImplementedError;
