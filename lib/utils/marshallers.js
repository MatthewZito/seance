export {
  serialize,
  deserialize
};

function serialize (payload) {
  return JSON.stringify(payload);
}

function deserialize (payload) {
  return JSON.parse(payload);
}
