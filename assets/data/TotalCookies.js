let totalCookies = 0;

function MoreCookies(amount = 1) {
  totalCookies += amount;
}

function getTotalCookies() {
  return totalCookies;
}

module.exports = { MoreCookies, getTotalCookies };
