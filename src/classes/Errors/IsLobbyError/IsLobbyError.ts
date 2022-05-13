import BaseError from "../BaseError";

class IsLobbyError extends BaseError {
  constructor(
    description = "Error! There is already a lobby in this channel!"
  ) {
    super(description);
  }
}

export default IsLobbyError;
