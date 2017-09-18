function generateUser() {
  let username = "";
  let password = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 10; i++) {
    username += possible.charAt(Math.floor(Math.random() * possible.length));
    password += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return {
    username: username,
    password: password
  };
}

module.exports = {
  generateUser
};
