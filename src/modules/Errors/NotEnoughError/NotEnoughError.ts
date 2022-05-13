import BaseError from "../BaseError";

class NotEnoughError extends BaseError {
  constructor(objects: string, description?: string) {
    // "Error! There are not enough players!"
    description = `Error! There are not enough ${objects}!`;
    super(description);
  }
}

export default NotEnoughError;
