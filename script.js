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
  addFilterButtonsListeners();
  addSortingListeners();

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
  document.querySelector("#statisticsButton").addEventListener("click", showStatistics);
}

function addFilterButtonsListeners() {
  let listButtons = document.querySelectorAll(".filter");
  listButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      if (this.dataset.filter === "all") {
        filtered = allStudents;
        listButtons.forEach((btn) => (btn.disabled = false));
        this.disabled = true;
      } else {
        filteringExpelled(this.dataset.filter);
        listButtons.forEach((btn) => (btn.disabled = false));
        this.disabled = true;
      }
      currentList = this.dataset.filter;
      document.getElementById("houseDropdown").selectedIndex = 0;
      displayList(filtered);
    });
  });
}

function addSortingListeners() {
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
      fillInStatistics();
      updateStudentAmount();
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

function fillInStatistics() {
  document.querySelector("#allStudents").textContent = allStudents.length;
  let housesArray = ["Gryffindor", "Hufflepuff", "Ravenclaw", "Slytherin"];
  housesArray.forEach((house) => {
    document.querySelector(`p#${house.toLowerCase()}`).textContent = allStudents.filter((student) => {
      return student.house === house;
    }).length;
  });
}

function updateStudentAmount() {
  document.querySelector("#nonexpelled").textContent = fineStudents.length;
  document.querySelector("#expelled").textContent = expelledStudents.length;
}

function expelStudent(student) {
  if (student.firstname === "Agata") {
    alert("are you insane?");
    closePopUp();
  } else {
    student.expelled = true;
    let index = fineStudents.indexOf(student);
    if (index > -1) {
      fineStudents.splice(index, 1); // 2nd parameter means remove one item only
    }
    if (student.prefect) {
      removeStudent(student, "prefect");
    }
    if (student.inqu) {
      removeStudent(student, "inqu");
    }
    expelledStudents.push(student);
    closePopUp();
    updateStudentAmount();
  }
  filteringExpelled(currentList);
  dropdown();
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
      }
    } else {
      alert("There can be only 2 prefects within one house.");
    }
    dropdown();
  }
}

function addToSquad(student) {
  if (!student.expelled) {
    if (student.blood === "Pure-blood" || student.house === "Slytherin") {
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
      }
    } else {
      alert("Student has to be of pure-blood or from Slytherin to be able to join the squad.");
    }
    dropdown();
  }
}

function removeStudent(student, specialFunction) {
  if (specialFunction === "prefect") {
    student.prefect = false;
    let index = prefects.indexOf(student);
    prefects.splice(index, 1); // 2nd parameter means remove one item only
    let otherPrefects = prefects.filter((prefect) => prefect.house === student.house);
    document.querySelector(`#${student.house.toLowerCase()}Prefects`).innerHTML = "";
    otherPrefects.forEach((student) => displaySpecial(student, "prefect"));
  } else if (specialFunction === "inqu") {
    student.inqu = false;
    let index = inquSquad.indexOf(student);
    inquSquad.splice(index, 1); // 2nd parameter means remove one item only
    document.querySelector("#inquMembers").innerHTML = "";
    inquSquad.forEach((student) => displaySpecial(student, "inqu"));
  }
  dropdown();
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

function filteringExpelled(expelledStatus) {
  if (expelledStatus != "all") {
    filtered = allStudents.filter((student) => String(student.expelled) == expelledStatus);
  }
}

function dropdown() {
  var value = document.getElementById("houseDropdown").options[houseDropdown.selectedIndex].value;
  if (value === "Reset") {
    displayList(filtered);
  } else {
    filterHouse(value);
  }
}

function filterHouse(house) {
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
  displayList(filtered);
}

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
    clone.querySelector("[data-field=prefect]").textContent = "P";
  } else {
    clone.querySelector("[data-field=prefect]").textContent = "";
  }
  if (student.inqu) {
    clone.querySelector("[data-field=inqu]").textContent = "I";
  } else {
    clone.querySelector("[data-field=inqu]").textContent = "";
  }
  if (student.expelled) {
    clone.querySelector("[data-field=expelled]").textContent = "E";
  } else {
    clone.querySelector("[data-field=expelled]").textContent = "";
  }
  clone.querySelector("tr").addEventListener("click", function () {
    removeListeners();
    showPopUp(student);
  });

  document.querySelector("#list tbody").appendChild(clone);
}

let expelListener = function () {
  expelStudent(globalStudent);
};

let prefectListener = function () {
  makeAPrefect(globalStudent);
};

let squadListener = function () {
  addToSquad(globalStudent);
};

function removeListeners() {
  document.querySelector(".expelButton").removeEventListener("click", expelListener);
  document.querySelector(".prefectButton").removeEventListener("click", prefectListener);
  document.querySelector(".inquButton").removeEventListener("click", squadListener);
}

function showPopUp(student) {
  globalStudent = student;
  document.querySelector(".popUp").classList.remove("hidden");
  document.querySelector("div > h1").textContent = student.firstname + " " + student.middlename + " " + student.lastname;
  document.querySelector("div > h2").textContent = student.house;
  document.querySelector("div > .blood").textContent = student.blood;
  document.querySelector("img").src = student.image;
  stylePopUp(student);

  if (student.expelled) {
    document.querySelector(".expelButton").disabled = true;
    document.querySelector(".prefectButton").disabled = true;
    document.querySelector(".inquButton").disabled = true;
    document.querySelector(".inqu").classList.add("hidden");
    document.querySelector(".prefect").classList.add("hidden");
    document.querySelector(".expelled").classList.remove("hidden");
  } else {
    document.querySelector(".expelButton").disabled = false;
    document.querySelector(".prefectButton").disabled = false;
    document.querySelector(".inquButton").disabled = false;
    document.querySelector(".expelled").classList.add("hidden");
    if (student.prefect) {
      document.querySelector(".prefectButton").disabled = true;
      document.querySelector(".prefect").classList.remove("hidden");
    } else {
      document.querySelector(".prefectButton").disabled = false;
      document.querySelector(".prefect").classList.add("hidden");
    }
    if (student.inqu) {
      document.querySelector(".inquButton").disabled = true;
      document.querySelector(".inqu").classList.remove("hidden");
    } else {
      document.querySelector(".inquButton").disabled = false;
      document.querySelector(".inqu").classList.add("hidden");
    }
  }
  document.querySelector(".expelButton").addEventListener("click", expelListener);
  document.querySelector(".prefectButton").addEventListener("click", prefectListener);
  document.querySelector(".inquButton").addEventListener("click", squadListener);

  document.querySelector(".popUp .closeButton").addEventListener("click", function () {
    closePopUp(student);
    removeListeners();
  });
  if (student.lastname === "") {
    document.querySelector("img").addEventListener("dblclick", function (e) {
      hackTheSystem();
    });
  }
}

function closePopUp() {
  document.querySelector(".popUp").classList.add("hidden");
}

//style pop-up window accordingly to student's house
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

function hackTheSystem() {
  hack = true;
  addAgata();
  allStudents.forEach(messWithBlood);
  hackTheStyle();
}

function hackTheStyle() {
  document.body.style.animation = "blink 0.5s steps(4, end)";
  document.body.style.color = "#3fc871";
  document.body.style.backgroundColor = "#000";
  document.documentElement.style.setProperty("--lightbeige", "#666");
  document.documentElement.style.setProperty("--darkbrown", "#3fc871");
}

function addAgata() {
  const agata = Object.create(Student);
  agata.firstname = "Agata";
  agata.lastname = "Szulc";
  agata.gender = "girl";
  agata.house = "Gryffindor";
  agata.image = getImage(agata, agata.firstname + " " + agata.lastname);
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
    student.blood = bloodArray[index];
  } else {
    student.blood = "Pure-blood";
  }
}

function showStatistics() {
  document.querySelector(".statistics").classList.remove("hidden");
  document.querySelector(".statistics .closeButton").addEventListener("click", closeStatistics);
}

function closeStatistics() {
  document.querySelector(".statistics").classList.add("hidden");
}
