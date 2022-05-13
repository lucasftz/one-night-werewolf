import BaseError from "../BaseError";

class NoLobbyError extends BaseError {
  constructor(
    description = "Error! There is no lobby in this channel!",
    footer = `Type >create to make a lobby`
  ) {
    super(description, footer);
  }
}

export default NoLobbyError;
