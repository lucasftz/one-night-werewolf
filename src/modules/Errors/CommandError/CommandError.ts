import BaseError from "../BaseError";

class CommandError extends BaseError {
  constructor(
    description = "Error! Command not found",
    footer = `Type >help to get a list of all the commands`
  ) {
    super(description, footer);
  }
}

export default CommandError;
