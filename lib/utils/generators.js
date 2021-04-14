export {
  generateUUID,
  generateID
};

/**
 * @summary RFC-4122 version 4-compliant UUID generator
 * @returns {string}
 */
 function generateUUID () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
    char => {
      const rand = Math.random() * 16 | 0;
      const digit = char == 'x' ? rand : (rand & 0x3 | 0x8);

      return digit.toString(16);
    });
}

/**
 * @generator
 * @summary Generate incremental ids, in sequence 1,1,
 * @returns {number}
 */
function generateID () {
  return (function* () {
    let n = 0;
    while (true) {
      yield ++n;
    }
  })();
}

