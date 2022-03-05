window.addEventListener("DOMContentLoaded", start);

const url = "https://petlatkea.dk/2021/hogwarts/students.json";
const allStudents = [];
const expelledStudents = [];
const fineStudents = [];
const prefects = [];
const inquSquad = [];
let filtered = [];
let currentList = "all";

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

const settings = {
  sortDir: undefined,
};

function start() {
  console.log("ready");
  loadJSON();

  let listButtons = document.querySelectorAll(".filter");
  listButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      console.log(this.dataset.filter);
      if (this.dataset.filter === "all") {
        filtered = allStudents;
      } else {
        filteringExpelled(this.dataset.filter);
      }
      currentList = this.dataset.filter;
      document.getElementById("houseDropdown").selectedIndex = 0;
      displayList(filtered);
    });
  });

  let allHeaders = document.querySelectorAll("th[data-action='sort']");
  allHeaders.forEach((th) => {
    th.addEventListener("click", function () {
      if (typeof clicked !== "undefined") {
        clicked.dataset.sortDirection = "";
      }
      if (settings.sortDir) {
        sortering(this.dataset.sort, true);
        settings.sortDir = false;
        this.dataset.sortDirection = "desc";
      } else {
        sortering(this.dataset.sort);
        settings.sortDir = true;
        this.dataset.sortDirection = "asc";
      }
      clicked = this;
    });
  });

  document.querySelector("#prefectsButton").addEventListener("click", function () {
    document.querySelector("#inquList").classList.add("hidden");
    document.querySelector("#prefectsList").classList.remove("hidden");
    this.disabled = true;
    document.querySelector("#inquButton").disabled = false;
  });

  document.querySelector("#inquButton").addEventListener("click", function () {
    document.querySelector("#prefectsList").classList.add("hidden");
    document.querySelector("#inquList").classList.remove("hidden");
    this.disabled = true;
    document.querySelector("#prefectsButton").disabled = false;
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
  filtered = allStudents;
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

function makeAPrefect(student) {
  student.prefect = true;
  if (!prefects.includes(student)) {
    prefects.push(student);
    displayPrefect(student);
    closePopUp();
  } //todo: else show info window
}

function addToSquad(student) {
  console.log(student);
  student.inqu = true;
  if (!inquSquad.includes(student)) {
    inquSquad.push(student);
    displaySquadMember(student);
    closePopUp();
  } //todo: else show info window
}

function displayPrefect(student) {
  const clone = document.querySelector("template#specialFunction").content.cloneNode(true);
  clone.querySelector("[data-field=firstname]").textContent = student.firstname;
  clone.querySelector("[data-field=lastname]").textContent = student.lastname;
  let studentHouse = student.house.toLowerCase();
  document.querySelector(`#${studentHouse}Prefects`).appendChild(clone);
}

function displaySquadMember(student) {
  const clone = document.querySelector("template#specialFunction").content.cloneNode(true);
  clone.querySelector("[data-field=firstname]").textContent = student.firstname;
  clone.querySelector("[data-field=lastname]").textContent = student.lastname;
  document.querySelector("#inquMembers").appendChild(clone);
}

function filteringExpelled(expelledStatus) {
  console.log(expelledStatus);
  allStudents.forEach((student) => console.log(student.expelled == expelledStatus));
  filtered = allStudents.filter((student) => String(student.expelled) == expelledStatus);
  // if (!filteredData.length) {
  //   filteredData = allStudents;
  // }
  // return filteredData;
}

function dropdown() {
  var value = document.getElementById("houseDropdown").options[houseDropdown.selectedIndex].value;
  if (value === "Reset") {
    //clearList();
    displayList(filtered);
    console.log("hi");
  } else {
    console.log(value);
    filterHouse(value);
  }
}

function filterHouse(house) {
  //clearList();
  console.log(currentList);
  switch (currentList) {
    case "all":
      filtered = allStudents.filter((student) => student.house === house);
      break;
    case "true":
      filtered = expelledStudents.filter((student) => student.house === house);
      break;
    case "false":
      filtered = fineStudents.filter((student) => student.house === house);
      break;
  }
  //filtered = filtered.filter((student) => student.house === house);
  displayList(filtered);
}

// function displayFiltered(animalType) {
//   filtered = filtering(animalType);
//   displayList(filtered);
// }

function sortByProperty(array, propertyName) {
  return array.sort(function (a, b) {
    if (a[propertyName] < b[propertyName]) {
      return -1;
    } else {
      return 1;
    }
  });
}

function sortering(sortBy, reversed) {
  console.log("sortowanko", filtered);
  filtered = sortByProperty(filtered, sortBy);
  console.log(sortBy);
  if (reversed === true) {
    filtered = filtered.reverse();
  }
  displayList(filtered);
}

function displayList(arrayToDisplay) {
  document.querySelector("#list tbody").innerHTML = "";
  arrayToDisplay.forEach(displayStudent);
}

function displayStudent(student) {
  const clone = document.querySelector("template#student").content.cloneNode(true);
  clone.querySelector("[data-field=firstname]").textContent = student.firstname;
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
  let expelListener = function () {
    expelStudent(student);
    removeListeners();
  };

  let prefectListener = function () {
    makeAPrefect(student);
    removeListeners();
  };

  let squadListener = function () {
    addToSquad(student);
    removeListeners();
  };

  document.querySelector(".expelButton").addEventListener("click", expelListener);
  document.querySelector(".prefectButton").addEventListener("click", prefectListener);
  document.querySelector(".inquButton").addEventListener("click", squadListener);
  document.querySelector(".closeButton").addEventListener("click", function () {
    closePopUp(student);
    removeListeners();
  });

  function removeListeners() {
    document.querySelector(".expelButton").removeEventListener("click", expelListener);
    document.querySelector(".prefectButton").removeEventListener("click", prefectListener);
    document.querySelector(".inquButton").removeEventListener("click", squadListener);
  }
}

//expelListener = function(){};

function closePopUp(student) {
  document.querySelector(".popUp").classList.add("hidden");
  //document.querySelector(".expelButton").removeEventListener("click", expelListener);

  console.log("close");
}

function clearList() {
  console.log("clear");

  const myNode = document.getElementById("list");
  while (myNode.childNodes.length > 3) {
    myNode.removeChild(myNode.lastChild);
  }
}
