function getFullDate() {
  return new Date().toISOString().substr(0, 10);
}

module.exports = { getFullDate };
