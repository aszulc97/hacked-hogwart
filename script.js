window.addEventListener("DOMContentLoaded", start);

const url = "https://petlatkea.dk/2021/hogwarts/students.json";
const allStudents = [];
const Student = {
  firstname: "",
  middlename: "",
  nickname: "",
  lastname: "",
  gender: "",
  house: "",
  image: "",
};

function start() {
  console.log("ready");
  loadJSON();
}

function loadJSON() {
  fetch(url)
    .then((response) => response.json())
    .then((data) => data.forEach(prepareObjects));
}

function prepareObjects(jsonStudent) {
  const student = Object.create(Student);
  let fullnameString = fixCapitalization(jsonStudent.fullname.trim());
  if (fullnameString.indexOf(" ") + 1) {
    student.firstname = fullnameString.substring(0, fullnameString.indexOf(" "));
    student.lastname = fullnameString.substring(fullnameString.lastIndexOf(" ") + 1);
  } else {
    student.firstname = fullnameString;
  }
  student.middlename = fullnameString.substring(fullnameString.indexOf(" ") + 1, fullnameString.lastIndexOf(" "));
  student.gender = jsonStudent.gender;
  student.house = fixCapitalization(jsonStudent.house.trim());
  student.image = getImage(fullnameString);

  allStudents.push(student);
  displayList();
}

function fixCapitalization(dataString) {
  let charArray = dataString.toLowerCase().split("");
  charArray[0] = charArray[0].charAt(0).toUpperCase();

  for (let i = 0; i < charArray.length + 1; i++) {
    if (charArray[i] === " " || charArray[i] === "-" || charArray[i] === '"') {
      charArray[i + 1] = charArray[i + 1].charAt(0).toUpperCase();
    }
  }
  console.log(charArray.join(""));
  return charArray.join("");
}

function getImage(fullname) {
  let lastname = fullname.substring(fullname.lastIndexOf(" ") + 1).toLowerCase();
  let imageUrl = "/images/" + lastname + "_" + fullname.charAt(0).toLowerCase() + ".png";
  if (imageExist(imageUrl)) {
    return imageUrl;
  } else {
    if (lastname.includes("-")) {
      imageUrl = "/images/" + lastname.substring(lastname.indexOf("-") + 1) + "_" + fullname.charAt(0).toLowerCase() + ".png";
      return imageUrl;
    } else {
      let firstname = fullname.substring(0, fullname.indexOf(" "));
      imageUrl = "/images/" + lastname + "_" + firstname.toLowerCase() + ".png";
      if (imageExist(imageUrl)) {
        return imageUrl;
      } else {
        return "/images/no_pic.png";
      }
    }
  }
}

function imageExist(url) {
  var img = new Image();
  img.src = url;
  return img.height;
}

function displayList() {
  document.querySelector("#list tbody").innerHTML = "";
  allStudents.forEach(displayStudent);
}

function displayStudent(student) {
  const clone = document.querySelector("template#student").content.cloneNode(true);

  clone.querySelector("[data-field=firstname]").textContent = student.firstname;
  // clone.querySelector("[data-field=middlename]").textContent = student.middlename;
  // clone.querySelector("[data-field=nickname]").textContent = student.nickname;
  clone.querySelector("[data-field=lastname]").textContent = student.lastname;
  clone.querySelector("[data-field=gender]").textContent = student.gender;
  clone.querySelector("[data-field=house]").textContent = student.house;
  // clone.querySelector("[data-field=image]>img").src = student.image;
  clone.querySelector("tr").addEventListener("click", function () {
    showPopUp(student);
  });

  document.querySelector("#list tbody").appendChild(clone);
}

function showPopUp(student) {
  // e.preventDefault();
  document.querySelector(".popUp").classList.remove("hidden");
  document.querySelector("div > h1").textContent = student.firstname + " " + student.middlename + " " + student.lastname;
  document.querySelector("div > h2").textContent = student.house;
  document.querySelector(".closeButton").addEventListener("click", closePopUp);
}

function closePopUp() {
  document.querySelector(".popUp").classList.add("hidden");
}
