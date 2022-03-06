window.addEventListener("DOMContentLoaded", start);

const allUrl = "https://petlatkea.dk/2021/hogwarts/students.json";
const bloodUrl = "https://petlatkea.dk/2021/hogwarts/families.json";
let halfBloodFams = [];
let pureBloodFams = [];
const allStudents = [];
const expelledStudents = [];
const fineStudents = [];
const prefects = [];
const inquSquad = [];
let filtered = [];
let currentList = "all";
let globalStudent;
let hack = false;

const Student = {
  firstname: "",
  middlename: "",
  nickname: "",
  lastname: "",
  gender: "",
  house: "",
  image: "",
  blood: "",
  prefect: false,
  inqu: false,
  expelled: false,
};

const settings = {
  sortDir: undefined,
};

function start() {
  console.log("ready");
  loadBloodJSON();

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

  document.querySelector("input").addEventListener("input", updateResult);
}

function loadBloodJSON() {
  fetch(bloodUrl)
    .then((response) => response.json())
    .then((data) => {
      halfBloodFams = data.half;
      pureBloodFams = data.pure;
      loadJSON();
    });
}

function loadJSON() {
  fetch(allUrl)
    .then((response) => response.json())
    .then((data) => {
      data.forEach(prepareObjects);
      // document.querySelector("button[data-filter='all']").textContent += ` (${allStudents.length})`;
      // updateStudentAmount();
      //todo: statistics
    });
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
  student.image = getImage(student, fullnameString);
  bloodType(student);

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

function getImage(student, fullname) {
  let lastname = fullname.substring(fullname.lastIndexOf(" ") + 1).toLowerCase();
  let imageUrl = "/images/" + lastname + "_" + fullname.charAt(0).toLowerCase() + ".png";
  imageExist(imageUrl, (exists) => {
    if (exists) {
      student.image = imageUrl;
    } else {
      if (lastname.includes("-")) {
        imageUrl = "/images/" + lastname.substring(lastname.indexOf("-") + 1) + "_" + fullname.charAt(0).toLowerCase() + ".png";
        student.image = imageUrl;
      } else {
        let firstname = fullname.substring(0, fullname.indexOf(" "));
        imageUrl = "/images/" + lastname + "_" + firstname.toLowerCase() + ".png";
        imageExist(imageUrl, (existsInner) => {
          if (existsInner) {
            student.image = imageUrl;
          } else {
            student.image = "/images/no_pic.png";
          }
        });
      }
    }
  });
}

function imageExist(url, callback) {
  const img = new Image();
  img.src = url;

  if (img.complete) {
    callback(true);
  } else {
    img.onload = () => {
      callback(true);
    };

    img.onerror = () => {
      callback(false);
    };
  }
}

function updateResult() {
  let searchFields = ["firstname", "lastname"];
  let query = document.querySelector("input").value.toLowerCase();
  let searchResult = filtered.filter((student) => {
    return searchFields.some((field) => student[field].toLowerCase().includes(query));
  });
  displayList(searchResult);
}

// function updateStudentAmount() {
//   document.querySelector("button[data-filter='false']").textContent += ` (${fineStudents.length})`;
//   document.querySelector("button[data-filter='true']").textContent += ` (${expelledStudents.length})`;
// }

function expelStudent(student) {
  // if (confirm("Are you sure you want to expel this student?")) {
  if (student.firstname === "Agata") {
    alert("are you insane?");
    closePopUp();
  } else {
    student.expelled = true;
    let index = fineStudents.indexOf(student);
    if (index > -1) {
      fineStudents.splice(index, 1); // 2nd parameter means remove one item only
    }
    expelledStudents.push(student);
    closePopUp();
  }
}

function makeAPrefect(student) {
  if (!student.expelled) {
    let prefectsWithinHouse = prefects.filter((futurePrefect) => futurePrefect.house === student.house);
    if (prefectsWithinHouse.length < 2) {
      student.prefect = true;
      if (!prefects.includes(student)) {
        prefects.push(student);
        displaySpecial(student, "prefect");
        closePopUp();
        document.querySelector("#inquList").classList.add("hidden");
        document.querySelector("#prefectsList").classList.remove("hidden");
        document.querySelector("#prefectsButton").disabled = true;
        document.querySelector("#inquButton").disabled = false;
      } //todo: else show info window
    } //todo: else show info
  } //todo: else info
}

function addToSquad(student) {
  if (!student.expelled) {
    if (student.blood === "Pure-blood" || student.house === "Slytherin") {
      console.log(student);
      student.inqu = true;
      if (!inquSquad.includes(student)) {
        inquSquad.push(student);
        displaySpecial(student, "inqu");
        closePopUp();
        document.querySelector("#prefectsList").classList.add("hidden");
        document.querySelector("#inquList").classList.remove("hidden");
        document.querySelector("#inquButton").disabled = true;
        document.querySelector("#prefectsButton").disabled = false;
        if (hack) {
          setTimeout(() => {
            removeStudent(student, "inqu");
          }, 2000);
        }
      } //todo: else show info window
    } //todo: else show info
  } //todo: else info
}

function removeStudent(student, specialFunction) {
  if (specialFunction === "prefect") {
    let index = prefects.indexOf(student);
    prefects.splice(index, 1); // 2nd parameter means remove one item only
    let otherPrefects = prefects.filter((prefect) => prefect.house === student.house);
    document.querySelector(`#${student.house.toLowerCase()}Prefects`).innerHTML = "";
    otherPrefects.forEach((student) => displaySpecial(student, "prefect"));
  } else if (specialFunction === "inqu") {
    let index = inquSquad.indexOf(student);
    inquSquad.splice(index, 1); // 2nd parameter means remove one item only
    document.querySelector("#inquMembers").innerHTML = "";
    inquSquad.forEach((student) => displaySpecial(student, "inqu"));
  }
}

function displaySpecial(student, parent) {
  const clone = document.querySelector("template#specialFunction").content.cloneNode(true);
  clone.querySelector("[data-field=fullname]").textContent = student.firstname + " " + student.lastname;
  if (parent === "prefect") {
    clone.querySelector("#removeButton").addEventListener("click", function () {
      removeStudent(student, "prefect");
    });
    let studentHouse = student.house.toLowerCase();
    document.querySelector(`#${studentHouse}Prefects`).appendChild(clone);
  } else if (parent === "inqu") {
    clone.querySelector("#removeButton").addEventListener("click", function () {
      removeStudent(student, "inqu");
    });
    document.querySelector("#inquMembers").appendChild(clone);
  }
}

// function displaySquadMember(student) {
//   const clone = document.querySelector("template#specialFunction").content.cloneNode(true);
//   clone.querySelector("[data-field=firstname]").textContent = student.firstname;
//   clone.querySelector("[data-field=lastname]").textContent = student.lastname;
//   document.querySelector("#inquMembers").appendChild(clone);
// }

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
  filtered = sortByProperty(filtered, sortBy);
  if (reversed === true) {
    filtered = filtered.reverse();
  }
  displayList(filtered);
}

function bloodType(student) {
  console.log(student.lastname);
  console.log(halfBloodFams);
  if (halfBloodFams.includes(student.lastname)) {
    student.blood = "Half-blood";
  } else if (pureBloodFams.includes(student.lastname)) {
    student.blood = "Pure-blood";
  } else {
    student.blood = "Muggle-born";
  }
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
    removeListeners();
    showPopUp(student);
  });

  document.querySelector("#list tbody").appendChild(clone);
}

let expelListener = function () {
  expelStudent(globalStudent);
  removeListeners();
};

let prefectListener = function () {
  makeAPrefect(globalStudent);
  removeListeners();
};

let squadListener = function () {
  addToSquad(globalStudent);
  removeListeners();
};

function removeListeners() {
  console.log("yo mama");
  document.querySelector(".expelButton").removeEventListener("click", expelListener);
  document.querySelector(".prefectButton").removeEventListener("click", prefectListener);
  document.querySelector(".inquButton").removeEventListener("click", squadListener);
}

function showPopUp(student) {
  // e.preventDefault();
  globalStudent = student;
  document.querySelector(".popUp").classList.remove("hidden");
  document.querySelector("div > h1").textContent = student.firstname + " " + student.middlename + " " + student.lastname;
  document.querySelector("div > h2").textContent = student.house;
  document.querySelector("div > .blood").textContent = student.blood;
  document.querySelector("img").src = student.image;
  stylePopUp(student);
  //todo: make buttons hidden if student.expelled

  document.querySelector(".expelButton").addEventListener("click", expelListener);
  document.querySelector(".prefectButton").addEventListener("click", prefectListener);
  document.querySelector(".inquButton").addEventListener("click", squadListener);
  document.querySelector(".closeButton").addEventListener("click", function () {
    closePopUp(student);
    removeListeners();
  });
  if (student.lastname === "") {
    document.querySelector("img").addEventListener("dblclick", function (e) {
      hackTheSystem();
    });
  }

  //document.querySelector(".popUp").addEventListener("DOMCharacterDataModified", removeListeners);
}

//expelListener = function(){};

function closePopUp() {
  document.querySelector(".popUp").classList.add("hidden");
  console.log("close");
}

function stylePopUp(student) {
  document.querySelector(".crestHolder").style.backgroundImage = `url("images/${student.house.toLowerCase()}.png")`;
  document.querySelectorAll(".popUp button").forEach((button) => {
    button.style.backgroundColor = `var(--${student.house.toLowerCase()})`;
    if (student.house === "Hufflepuff") {
      button.style.color = "#000";
    } else {
      button.style.color = "#fff";
    }
  });
}

// function clearList() {
//   const myNode = document.getElementById("list");
//   while (myNode.childNodes.length > 3) {
//     myNode.removeChild(myNode.lastChild);
//   }
// }

function hackTheSystem() {
  // alert("yo mama");
  hack = true;
  addAgata();
  allStudents.forEach(messWithBlood);
  document.body.style.color = "#3fc871";
  document.body.style.backgroundColor = "#000";
  document.documentElement.style.setProperty("--lightbeige", "#666");
}

function addAgata() {
  const agata = Object.create(Student);
  agata.firstname = "Agata";
  agata.lastname = "Szulc";
  agata.gender = "girl";
  agata.house = "Gryffindor";
  agata.image = getImage(agata, agata.firstname + " " + agata.lastname);
  makeAPrefect(agata);
  allStudents.push(agata);
  fineStudents.push(agata);
  filtered = allStudents;
  displayList(allStudents);
}

function messWithBlood(student) {
  if (halfBloodFams.includes(student.lastname)) {
    student.blood = "Pure-blood";
  } else if (pureBloodFams.includes(student.lastname)) {
    let bloodArray = ["Pure-blood", "Half-blood", "Muggle-born"];
    let index = Math.floor(Math.random() * 3);
    console.log(index);
    student.blood = bloodArray[index];
  } else {
    student.blood = "Pure-blood";
  }
}
