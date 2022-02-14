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
  let middle = fullnameString.substring(
    fullnameString.indexOf(" ") + 1,
    fullnameString.lastIndexOf(" ")
  );
  if (fullnameString.indexOf(" ") + 1) {
    student.firstname = fullnameString.substring(0, fullnameString.indexOf(" "));
    student.lastname = fullnameString.substring(fullnameString.lastIndexOf(" ") + 1);
  } else {
    student.firstname = fullnameString;
  }
  if (middle.charAt(0) === '"') {
    student.nickname = middle.substring(1, middle.length - 1);
  } else {
    student.middlename = middle;
  }

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
  //console.log(checkExists("/images/" + lastname + "_" + fullname.charAt(0).toLowerCase() + ".png"));
  return imageUrl;
}

//   checkExists(imageUrl, function (exists) {
//     if (!exists) {
//       if (lastname.includes("-")) {
//         imageUrl =
//           "/images/" +
//           lastname.substring(lastname.indexOf("-") + 1) +
//           "_" +
//           fullname.charAt(0).toLowerCase() +
//           ".png";
//         console.log("nie dziala", imageUrl);
//       }
//     }
//   });
//   console.log("heja");
//   return imageUrl;
// }

function displayList() {
  // clear the list
  document.querySelector("#list tbody").innerHTML = "";

  // build a new list
  allStudents.forEach(displayStudent);
}

function displayStudent(student) {
  // create clone
  const clone = document.querySelector("template#student").content.cloneNode(true);

  // set clone data
  clone.querySelector("[data-field=firstname]").textContent = student.firstname;
  clone.querySelector("[data-field=middlename]").textContent = student.middlename;
  clone.querySelector("[data-field=nickname]").textContent = student.nickname;
  clone.querySelector("[data-field=lastname]").textContent = student.lastname;
  clone.querySelector("[data-field=gender]").textContent = student.gender;
  clone.querySelector("[data-field=house]").textContent = student.house;
  clone.querySelector("[data-field=image]>img").src = student.image;
  //   clone.querySelector("[data-field=lastname]").textContent = student.desc;

  // append clone to list
  document.querySelector("#list tbody").appendChild(clone);
}
