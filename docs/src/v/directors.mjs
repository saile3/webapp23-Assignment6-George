/**
 * @fileOverview  View code of UI for managing Director data
 * @author Gerd Wagner
 * @copyright Copyright 2013-2021 Gerd Wagner, Chair of Internet Technology, Brandenburg University of Technology, Germany.
 * @license This code is licensed under The Code Project Open License (CPOL), implying that the code is provided "as-is",
 * can be modified to create derivative works, can be redistributed, and can be used in commercial applications.
 */
/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
import Director from "../m/Director.mjs";
import Person from "../m/Person.mjs";
import { displaySegmentFields, undisplayAllSegmentFields } from "./app.mjs"
import { fillSelectWithOptions } from "../../lib/util.mjs";

/***************************************************************
 Load data
 ***************************************************************/
Director.retrieveAll();

/***************************************************************
 Set up general, use-case-independent UI elements
 ***************************************************************/
// set up back-to-menu buttons for all use cases
for (const btn of document.querySelectorAll("button.back-to-menu")) {
  btn.addEventListener('click', refreshManageDataUI);
}
// neutralize the submit event for all use cases
for (const frm of document.querySelectorAll("section > form")) {
  frm.addEventListener("submit", function (e) {
    e.preventDefault();
    frm.reset();
  });
}
// save data when leaving the page
window.addEventListener("beforeunload", function () {
  Director.saveAll();
});

/**********************************************
 * Use case List Directors
**********************************************/
document.getElementById("RetrieveAndListAll").addEventListener("click", function () {
  const tableBodyEl = document.querySelector("section#Director-R>table>tbody");
  // reset view table (drop its previous contents)
  tableBodyEl.innerHTML = "";
  // populate view table
  for (const key of Object.keys(Director.instances)) {
    const director = Director.instances[key];
    const row = tableBodyEl.insertRow();
    row.insertCell().textContent = director.personId;
    row.insertCell().textContent = director.name;
  }
  document.getElementById("Director-M").style.display = "none";
  document.getElementById("Director-R").style.display = "block";
});

/**********************************************
 * Use case Create Director
**********************************************/
const createFormEl = document.querySelector("section#Director-C > form");
const crtSelCategoryEl = createFormEl.selectCategory;
//----- set up event handler for menu item "Create" -----------
document.getElementById("Create").addEventListener("click", function () {
  document.getElementById("Director-M").style.display = "none";
  document.getElementById("Director-C").style.display = "block";
  createFormEl.reset();
});
// set up event handlers for responsive constraint validation
createFormEl.personId.addEventListener("input", function () {
  createFormEl.personId.setCustomValidity(
    Person.checkPersonIdAsId(createFormEl.personId.value, Director).message);
});
/* SIMPLIFIED CODE: no responsive validation of name and biography */

// handle Save button click events
createFormEl["commit"].addEventListener("click", function () {
  const slots = {
    personId: createFormEl.personId.value,
    name: createFormEl.name.value
  };

  // check all input fields and show error messages
  createFormEl.personId.setCustomValidity(
    Person.checkPersonIdAsId(slots.personId).message);
  /* SIMPLIFIED CODE: no before-submit validation of name */
  // save the input data only if all form fields are valid
  if (createFormEl.checkValidity()) Director.add(slots);
});
// define event listener for pre-filling superclass attributes
createFormEl.personId.addEventListener("change", function () {
  const persId = createFormEl.personId.value;
  if (persId in Person.instances) {
    createFormEl.name.value = Person.instances[persId].name;
    // set focus to next field
    createFormEl.empNo.focus();
  }
});


/**********************************************
 * Use case Update Director
**********************************************/
const updateFormEl = document.querySelector("section#Director-U > form"),
  updSelDirectorEl = updateFormEl.selectDirector,
  updSelCategoryEl = updateFormEl.selectCategory;
//----- set up event handler for menu item "Update" -----------
document.getElementById("Update").addEventListener("click", function () {
  // reset selection list (drop its previous contents)
  updSelDirectorEl.innerHTML = "";
  // populate the selection list
  fillSelectWithOptions(updSelDirectorEl, Director.instances,
    "personId", { displayProp: "name" });
  document.getElementById("Director-M").style.display = "none";
  document.getElementById("Director-U").style.display = "block";
  updateFormEl.reset();
});
// handle change events on director select element
updSelDirectorEl.addEventListener("change", handleDirectorSelectChangeEvent);


// handle Save button click events
updateFormEl["commit"].addEventListener("click", function () {
  const directorIdRef = updSelDirectorEl.value;
  if (!directorIdRef) return;
  const slots = {
    personId: updateFormEl.personId.value,
    name: updateFormEl.name.value,
  }
  // check all property constraints
  /*SIMPLIFIED CODE: no before-save validation of name */
  // save the input data only if all of the form fields are valid
  if (updSelDirectorEl.checkValidity()) {
    Director.update(slots);
    // update the author selection list's option element
    updSelDirectorEl.options[updSelDirectorEl.selectedIndex].text = slots.name;
  }
});
/**
 * handle director selection events
 * on selection, populate the form with the data of the selected director
 */
function handleDirectorSelectChangeEvent() {
  const key = updateFormEl.selectDirector.value;
  if (key) {
    const emp = Director.instances[key];
    updateFormEl.personId.value = emp.personId;
    updateFormEl.name.value = emp.name;
  } else {
    updateFormEl.reset();
  }
}

/**********************************************
 * Use case Delete Director
**********************************************/
const deleteFormEl = document.querySelector("section#Director-D > form");
const delSelDirectorEl = deleteFormEl.selectDirector;
//----- set up event handler for menu item "Delete" -----------
document.getElementById("Delete").addEventListener("click", function () {
  // reset selection list (drop its previous contents)
  delSelDirectorEl.innerHTML = "";
  // populate the selection list
  fillSelectWithOptions(delSelDirectorEl, Director.instances,
    "personId", { displayProp: "name" });
  document.getElementById("Director-M").style.display = "none";
  document.getElementById("Director-D").style.display = "block";
  deleteFormEl.reset();
});
// handle Delete button click events
deleteFormEl["commit"].addEventListener("click", function () {
  const personIdRef = delSelDirectorEl.value;
  if (!personIdRef) return;
  if (confirm("Do you really want to delete this director?")) {
    Director.destroy(personIdRef);
    delSelDirectorEl.remove(delSelDirectorEl.selectedIndex);
  }
});

/**********************************************
 * Refresh the Manage Directors Data UI
 **********************************************/
function refreshManageDataUI() {
  // show the manage director UI and hide the other UIs
  document.getElementById("Director-M").style.display = "block";
  document.getElementById("Director-R").style.display = "none";
  document.getElementById("Director-C").style.display = "none";
  document.getElementById("Director-U").style.display = "none";
  document.getElementById("Director-D").style.display = "none";
}

/**
 * event handler for director category selection events
 * used both in create and update
 */
function handleCategorySelectChangeEvent(e) {
  var formEl = e.currentTarget.form,
    categoryIndexStr = formEl.selectCategory.value,  // the array index of DirectorCategoryEL.labels
    category = 0;
  if (categoryIndexStr) {
    // convert array index to enum index
    category = parseInt(categoryIndexStr) + 1;
    switch (category) {
      case DirectorCategoryEL.MANAGER:
        formEl.department.addEventListener("input", function () {
          formEl.department.setCustomValidity(
            Director.checkDepartment(formEl.department.value, category).message);
        });
        break;
    }
    displaySegmentFields(formEl, DirectorCategoryEL.labels, category);
  } else {
    undisplayAllSegmentFields(formEl, DirectorCategoryEL.labels);
  }
}

// Set up Manage Directors UI
refreshManageDataUI();
