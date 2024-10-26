const paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "sandbox",
  client_id: "AaY6qeR1VJgkZJRrXxcKgluTyWvmFZVtuwRf3R1cLlM2lMSyk8hfU1cVoktK--IQQqOYbFFW7k_HZkSv",
  client_secret: "EAcwwno_KFL426fGN2bJ2nxMOTqAF35GHDQh7g3LhTA8mmtrGeekBX6Z2mfaWStwYhr0jW3bFufqebq5",
});

module.exports = paypal;