window.addEventListener("DOMContentLoaded", start);

const url = "https://petlatkea.dk/2021/hogwarts/students.json";
const allStudents = [];
const expelledStudents = [];
const fineStudents = [];
const Student = {
  firstname: "",
  middlename: "",
  nickname: "",
  lastname: "",
  gender: "",
  house: "",
  image: "",
  prefect: false,
  inqu: false,
  expelled: false,
};

function start() {
  console.log("ready");
  loadJSON();

  let listButtons = document.querySelectorAll(".filter");
  listButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      console.log(this.dataset.filter);
      if (this.dataset.filter === "all") {
        displayList(allStudents);
      } else {
        displayList(filteringExpelled(this.dataset.filter));
      }
    });
  });
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
  fineStudents.push(student);
  displayList(allStudents);
}

function fixCapitalization(dataString) {
  let charArray = dataString.toLowerCase().split("");
  charArray[0] = charArray[0].charAt(0).toUpperCase();

  for (let i = 0; i < charArray.length + 1; i++) {
    if (charArray[i] === " " || charArray[i] === "-" || charArray[i] === '"') {
      charArray[i + 1] = charArray[i + 1].charAt(0).toUpperCase();
    }
  }
  return charArray.join("");
}

function getImage(fullname) {
  let lastname = fullname.substring(fullname.lastIndexOf(" ") + 1).toLowerCase();
  let imageUrl = "/images/" + lastname + "_" + fullname.charAt(0).toLowerCase() + ".png";
  console.log("height", fullname, imageExist(imageUrl));
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

function expelStudent(student) {
  // if (confirm("Are you sure you want to expel this student?")) {
  student.expelled = true;
  let index = fineStudents.indexOf(student);
  if (index > -1) {
    fineStudents.splice(index, 1); // 2nd parameter means remove one item only
  }
  expelledStudents.push(student);
  closePopUp();
}
//}

function filteringExpelled(expelledStatus) {
  console.log(expelledStatus);
  allStudents.forEach((student) => console.log(student.expelled == expelledStatus));
  let filteredData = allStudents.filter((student) => String(student.expelled) == expelledStatus);
  // if (!filteredData.length) {
  //   filteredData = allStudents;
  // }
  return filteredData;
}

function dropdown() {
  var value = document.getElementById("houseDropdown").options[houseDropdown.selectedIndex].value;
  if (value === "Reset") {
    //clearList();
    displayList(allStudents);
    console.log("hi");
  } else {
    console.log(value);
    filterHouse(value);
  }
}

function filterHouse(house) {
  //clearList();
  const filtered = allStudents.filter((student) => student.house === house);
  console.log(filtered);
  displayList(filtered);
}

// function displayFiltered(animalType) {
//   filtered = filtering(animalType);
//   displayList(filtered);
// }

function displayList(arrayToDisplay) {
  document.querySelector("#list tbody").innerHTML = "";
  console.log("arraytodisp", arrayToDisplay);
  arrayToDisplay.forEach(displayStudent);
}

function displayStudent(student) {
  const clone = document.querySelector("template#student").content.cloneNode(true);
  clone.querySelector("[data-field=firstname]").textContent = student.firstname;
  // clone.querySelector("[data-field=middlename]").textContent = student.middlename;
  // clone.querySelector("[data-field=nickname]").textContent = student.nickname;
  clone.querySelector("[data-field=lastname]").textContent = student.lastname;
  clone.querySelector("[data-field=gender]").textContent = student.gender;
  clone.querySelector("[data-field=house]").textContent = student.house;
  if (student.prefect) {
    clone.querySelector("[data-field=prefect]").textContent = "t";
  } else {
    clone.querySelector("[data-field=prefect]").textContent = "f";
  }
  if (student.inqu) {
    clone.querySelector("[data-field=inqu]").textContent = "t";
  } else {
    clone.querySelector("[data-field=inqu]").textContent = "f";
  }
  if (student.expelled) {
    clone.querySelector("[data-field=expelled]").textContent = "t";
  } else {
    clone.querySelector("[data-field=expelled]").textContent = "f";
  }
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
  document.querySelector("img").src = student.image;
  document.querySelector(".expelButton").addEventListener("click", function () {
    expelStudent(student);
  });
  document.querySelector(".closeButton").addEventListener("click", closePopUp);
}

function closePopUp() {
  document.querySelector(".popUp").classList.add("hidden");
}

function clearList() {
  console.log("clear");
  const myNode = document.getElementById("list");
  while (myNode.childNodes.length > 3) {
    myNode.removeChild(myNode.lastChild);
  }
}
