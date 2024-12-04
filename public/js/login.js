/* eslint-disable*/
const login = async (email, password) => {
  console.log(email, password);
  try {
    const res = await fetch("http://127.0.0.1:8000/api/v1/users/login", {
      method: "POST",
      data: JSON.stringify({
        email,
        password,
      }),
    });
    console.log("Response: ", res);
  } catch (err) {
    console.log("Error: ", JSON.stringify(err));
  }
};

document.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  login(email, password);
});
