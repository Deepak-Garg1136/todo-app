const text = document.getElementById("text");
const list = document.getElementById("list");
var temp = 0;
var uniqueID = 1;
var checkBoxID = 0;
var isChecked = false;

function onEnterPress(event) {
  if (event.key === "Enter" || event.keyCode === 13) {
    event.preventDefault();
    fetch("/todolist", {
      method: "POST",
      body: JSON.stringify({
        task: text.value.trim(),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        return response.json();
        // INFO :- This if else block is optional because it will automatically goes to the catch block if error occurred.
      })
      .then((data) => {
        console.log(data);
        let img = document.createElement("img");
        img.setAttribute("src", "/images/image.png");
        let li = document.createElement("li");
        // li.innerText = data.task;
        li.setAttribute("id", data.id);
        let textNode = document.createTextNode(data.task);
        li.appendChild(img);
        li.appendChild(textNode);
        addIcon(li, false, data.id);
        list.appendChild(li);
        text.value = "";
      })
      .catch((error) => {
        alert("Request failed: an error occurred: ");
      });
  }
}

function getData() {
  fetch("/getTasks")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      // alert(data[0].check);
      for (let i = 0; i < data.length; i++) {
        let img = document.createElement("img");
        if (data[i].hasOwnProperty("src")) {
          img.setAttribute("src", data[i].src);
        } else {
          img.setAttribute("src", "/images/image.png");
        }
        let li = document.createElement("li");
        // li.innerHTML = data[i].task;
        li.setAttribute("id", data[i].id);
        let textNode = document.createTextNode(data[i].task);
        li.appendChild(img);
        li.appendChild(textNode);
        addIcon(li, data[i].check, data[i].id);
        if (data[i].check === true) {
          li.classList.add("task");
        } else {
          li.classList.remove("task");
        }
        list.appendChild(li);
      }
    })
    .catch((error) => {
      console.error("Error occurred: ", error);
    });
}

function addIcon(li, checkLS, uniId) {
  const fileIconId = "pic" + uniId;
  const iconFile = document.createElement("input");
  iconFile.setAttribute("type", "file");
  iconFile.setAttribute("name", "file");
  iconFile.setAttribute("id", fileIconId);
  iconFile.style.display = "none";
  const label = document.createElement("label");
  label.setAttribute("for", fileIconId);
  label.innerHTML = "<i class='fa-solid fa-file-arrow-up'></i>";
  label.setAttribute("id", "icon0");
  li.appendChild(label);
  li.appendChild(iconFile);

  const iconedit = document.createElement("span");
  iconedit.innerHTML = "<i class = 'fa-solid fa-pen-to-square'></i>";
  iconedit.setAttribute("id", "icon1");
  li.appendChild(iconedit);

  const checkBoxicon = document.createElement("input");
  checkBoxicon.setAttribute("type", "checkbox");
  if (checkLS === true) {
    checkBoxicon.checked = true;
  } else {
    checkBoxicon.checked = false;
  }
  checkBoxicon.setAttribute("id", checkBoxID);
  checkBoxicon.setAttribute("class", "icon2");
  li.appendChild(checkBoxicon);

  const deleteIcon = document.createElement("span");
  deleteIcon.innerHTML = "<i class = 'fa-solid fa-trash'></i>";
  deleteIcon.setAttribute("id", "icon3");
  li.appendChild(deleteIcon);

  deleteIcon.addEventListener("click", function () {
    const deleteId = li.getAttribute("id");
    deleteTask(deleteId);
    li.remove(); // Remove the corresponding <li> element when delete icon is clicked
  });

  checkBoxicon.addEventListener("click", function () {
    const listId = li.getAttribute("id");
    console.log(listId);
    checkSer(listId);
    li.classList.toggle("task");
  });

  iconedit.addEventListener("click", function () {
    const listId = li.getAttribute("id");
    var editedtask = prompt("Enter edited task");
    if (editedtask.trim() === "") {
      alert("It can not be blanked");
    } else {
      editTaskFunc(listId, editedtask, li);
    }
  });
  iconFile.addEventListener("change", function (e) {
    // alert("upload");
    const listId = li.getAttribute("id");
    // const ele = e.target
    const uploadItem = e.target;
    console.log(uploadItem.files);
    console.log(listId);
    // INFO :- files gives all the information about the selected files
    const fileToUpload = uploadItem.files[0];
    uploadFile(listId, fileToUpload, li);
  });
}

function uploadFile(listId, fileToUpload, li) {
  const formData = new FormData();
  console.log(fileToUpload);

  formData.append("file", fileToUpload);
  formData.append("listId", listId);
  console.log(formData);
  // INFO :- formData.append("file", fileToUpload) is used to add the file to the form data
  // INFO :- formData.append("listId", listId) is used to add the listId to the form data
  // INFO :- console.log(formData) is used to print the form data in the console
  // INFO :- console.log(typeof formData) is used to print the type of the form data in the console
  // INFO :- console.log(fileToUpload) is used to print the fileToUpload in the console
  // INFO :- console.log(typeof fileToUpload) is used to print the type of the fileToUpload in the console
  // INFO :- console.log(listId) is used to print the listId in the console
  console.log(typeof formData);
  fetch("/uploadFiles", {
    method: "POST",
    body: formData,
    // headers: {
    //   "Content-Type": "multipart/form-data",
    // },
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          throw new Error(data.error);
        });
      }
      return response.json();
    })
    .then((data) => {
      // let img = document.createElement("img");
      let img = li.childNodes[0];
      console.log(data);
      console.log(typeof data);
      img.setAttribute("src", data.file);
      // li.appendChild(img);
      alert(data.message);
    })
    .catch((error) => {
      alert(error.message);
    });
}
function checkSer(id) {
  fetch("/updateCheckValue", {
    method: "PUT",
    body: JSON.stringify({
      listId: id,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
    });
}

function deleteTask(id) {
  fetch("/deleteTask", {
    method: "DELETE",
    body: JSON.stringify({
      listId: id,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
    });
}

function editTaskFunc(id, newTask, li) {
  fetch("/editTask", {
    method: "PUT",
    body: JSON.stringify({
      listId: id,
      task: newTask,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log(data);
      // let img = document.createElement("img");
      li.removeChild(li.childNodes[1]);
      // img.setAttribute("src", data.src);
      let textNode = document.createTextNode(data.task);
      // text.innerText = data.task;
      li.setAttribute("id", data.id);
      // li.appendChild(img);
      li.insertBefore(textNode, li.childNodes[1]);
      // addIcon(li, data.check, data.id);
      // alert("Task edited successfully");
    })
    .catch((error) => {
      alert("Error occurred while editing task: Please try again later.");
    });
}

text.addEventListener("keydown", onEnterPress);

getData();
