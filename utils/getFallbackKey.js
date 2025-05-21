let current = 0;

function getFallbackKey(keys) {
  return () => {
    const key = keys[current];
    current = (current + 1) % keys.length;
    return key;
  };
}

module.exports = getFallbackKey;
