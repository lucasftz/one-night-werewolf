import BaseError from "../BaseError";

class IsGameError extends BaseError {
  constructor(
    description = "Error! There already is a game in progress in this channel!"
  ) {
    super(description);
  }
}

export default IsGameError;
