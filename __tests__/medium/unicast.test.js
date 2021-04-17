describe('Evaluation of outbound, unicast messages and communications', () => {
  it.todo('emits a `MOUNT` message when the mount lifecycle is invoked');
  it.todo('emits an `UNMOUNT` message when the unMount lifecycle is invoked');
  it.todo('emits a `SYN` message at n interval once `poll` is invoked');
  it.todo('emits a `GET` message when the get api is called');
  it.todo('emits a `SET` message when the set api is called');
  it.todo('emits a `DELETE` message when the delete api is called');
});

describe('Evaluation of inbound messages and communications', () => {
  it.todo('receives messages via the `message` event');
  it.todo('drops messages from origins other than that of the Seance');
  it.todo('drops messages that do not have data');
  it.todo('drops messages whose data is not serialized');
  it.todo('drops messages whose data does not contain an id OR an error and result');
  it.todo('sets the `preflight` flag to `null` upon receipt of a destroy id and close event');
  it.todo('returns upon receipt of a destroy id and close event');
  it.todo('sets the `preflight` flag to `fulfilled` upon receipt of an ACK signal');
  it.todo('invokes the callback from the responses map that corresponds to the message id');
  it.todo('removes the received id from the responses map in all cases of an accepted message');
});
