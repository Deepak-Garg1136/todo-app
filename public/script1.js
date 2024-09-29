let signupbutton = document.getElementById("signupbutton");
let susername = document.getElementById("susername");
let semail = document.getElementById("semail");
let spass = document.getElementById("spass");
let loginbutton = document.getElementById("loginbutton");
let lemail = document.getElementById("lemail");
let lpass = document.getElementById("lpass");
if (signupbutton != null) {
  signupbutton.addEventListener("click", (event) => {
    event.preventDefault();
    signup();
  });
}

if (loginbutton != null) {
  loginbutton.addEventListener("click", (event) => {
    event.preventDefault();
    login();
  });
}
function signup() {
  if (semail.value.trim() == "" || susername.value.trim() == "") {
    alert("Please fill all the fields");
    return;
  }
  if (!validatePassWord(spass.value)) {
    alert(
      "Password must contain at least 8 characters, atleast one uppercase letter, atleast one lowercase letter and one number and special characters"
    );
  } else {
    fetch("/signup", {
      method: "POST",
      body: JSON.stringify({
        username: susername.value,
        email: semail.value,
        password: spass.value,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        //const res = await response.json();
        console.log(response);
        console.log(response);
        if (response.ok) {
          window.location.href = "/login";
          susername.value = "";
          semail.value = "";
          spass.value = "";
          alert("Registered successfully");
          return response.json();
        } else {
          return response.json();
          // throw new Error(error.error);
        }
      })
      .then((data) => {
        if (data.hasOwnProperty("messageerror")) {
          alert(data.messageerror);
          susername.value = "";
          semail.value = "";
          spass.value = "";
        }
        //console.log(data);
      })
      .catch((error) => {
        alert(error);
      });
  }
}

function login() {
  fetch("/login", {
    method: "POST",
    body: JSON.stringify({
      email: lemail.value,
      password: lpass.value,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.ok) {
        window.location.href = "/home";
        alert("Logged in successFully");
        lemail.value = "";
        lpass.value = "";
      } else {
        return response.json();
      }
    })
    .then((data) => {
      if (data.hasOwnProperty("messageerror")) {
        alert(data.messageerror);
        lemail.value = "";
        lpass.value = "";
      }
    });
}

// function loginInRequest(){
//   fetch("/login", //{
//   //   method: "POST",
//   //   body: JSON.stringify({
//   //     username: lusername.value,
//   //     password: lpass.value,
//   //   }),
//   //   headers: {
//   //     "Content-Type": "application/json",
//   //   },
//   // }
// )
//    .then((response) => {
//       console.log(response);
//       return response.json();
//     })
//    .then((data) => {
//       console.log(data);
//       alert(data);
//     });
// }

function validatePassWord(pass) {
  const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordPattern.test(pass);
}
