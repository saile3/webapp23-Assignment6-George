/**
 * @fileOverview  Defines utility procedures/functions   
 * @author Gerd Wagner
 */
// *************** I N T E G E R - Related *************************************
function isIntegerOrIntegerString(x) {
  return Number.isInteger(parseInt(x));
}
/**
* Verifies if a value represents a non-negative integer
* @param {number} x
* @return {boolean}
*/
function isNonNegativeInteger(x) {
  return Number.isInteger(x) && x >= 0;
}
/**
* Verifies if a value represents a positive integer
* @param {number} x
* @return {boolean}
*/
function isPositiveInteger(x) {
  return Number.isInteger(x) && x > 0;
}
// *************** D A T E - Related ****************************************
/**
 * Verifies if a string represents an ISO date string, which have the format YYYY-MM-DD
 * @param {string} ds
 * @return {string}
 */
function isNotIsoDateString(ds) {
  var dateArray = [], YYYY = 0, MM = 0, DD = 0;
  if (typeof (ds) !== "string") return "Date value must be a string!";
  dateArray = ds.split("-");
  if (dateArray.length < 3) return "Date string has less than 2 dashes!";
  YYYY = parseInt(dateArray[0]);
  MM = parseInt(dateArray[1]);
  DD = parseInt(dateArray[2]);
  if (!Number.isInteger(YYYY) || YYYY < 1000 || YYYY > 9999) return "YYYY out of range!";
  if (!Number.isInteger(MM) || MM < 1 || MM > 12) return "MM out of range!";
  if (!Number.isInteger(DD) || DD < 1 || DD > 31) return "MM out of range!";
  return "";
}
/**
 * Serialize a Date object as an ISO date string
 * @return  YYYY-MM-DD
 */
function createIsoDateString(d) {
  return d.toISOString().substring(0, 10);
}
/**
 * Return the next year value (e.g. if now is 2013 the function will return 2014)
 * @return the integer representing the next year value
 */
function nextYear() {
  var date = new Date();
  return (date.getFullYear() + 1);
}
// *************** D O M - Related ****************************************
/**
 * Create a DOM element
 *
 * @param {string} elemName
 * @param {string} id [optional]
 * @param {string} classValues [optional]
 * @param {string} txt [optional]
 *
 * @return {object}
 */
function createElement(elemName, id, classValues, txt) {
  var el = document.createElement(elemName);
  if (id) el.id = id;
  if (classValues) el.className = classValues;
  if (txt) el.textContent = txt;
  return el;
}
function createDiv(id, classValues, txt) {
  return createElement("div", id, classValues, txt);
}
function createSpan(id, classValues, txt) {
  return createElement("span", id, classValues, txt);
}
function createPushButton(id, classValues, txt) {
  var pB = createElement("button", id, classValues, txt);
  pB.type = "button";
  return pB;
}
/**
 * Create a DOM option element
 *
 * @param {string} val
 * @param {string} txt
 * @param {string} classValues [optional]
 *
 * @return {object}
 */
function createOption(val, txt, classValues) {
  var el = document.createElement("option");
  el.value = val;
  el.text = txt;
  if (classValues) el.className = classValues;
  return el;
}
/**
 * Create a time element from a Date object
 *
 * @param {object} d
 * @return {object}
 */
function createTimeElem(d) {
  var tEl = document.createElement("time");
  tEl.textContent = d.toLocaleDateString();
  tEl.datetime = d.toISOString();
  return tEl;
}
/**
 * Create a list element from an map of objects
 *
 * @param {object} aa  An map of objects
 * @param {string} displayProp  The object property to be displayed in the list
 * @return {object}
 */
function createListFromAssocArray(aa, displayProp) {
  var listEl = document.createElement("ul");
  fillListFromMap(listEl, aa, displayProp);
  return listEl;
}
/**
 * Fill a list element with items from an map of objects
 *
 * @param {object} listEl  A list element
 * @param {object} aa  An map of objects
 * @param {string} displayProp  The object property to be displayed in the list
 */
function fillListFromMap(listEl, aa, displayProp) {
  const keys = Object.keys(aa);
  // delete old contents
  listEl.innerHTML = "";
  // create list items from object property values
  for (const key of keys) {
    const listItemEl = document.createElement("li");
    listItemEl.textContent = aa[keys[j]][displayProp];
    listEl.appendChild(listItemEl);
  }
}
/**
 * Fill a select element with option elements created from an
 * map of objects
 *
 * @param {object} selectEl  A select(ion list) element
 * @param {object|array} selectionRange  A map of objects or an array
 * @param {string} keyProp [optional]  The standard identifier property
 * @param {object} optPar [optional]  A record of optional parameter slots
 *                 including optPar.displayProp and optPar.selection
 */
function fillSelectWithOptions(selectEl, selectionRange, keyProp, optPar) {
  var optionEl = null, displayProp = "";
  // delete old contents
  selectEl.innerHTML = "";
  // create "no selection yet" entry
  if (!selectEl.multiple) selectEl.add(createOption("", " --- "));
  // create option elements from object property values
  var options = Array.isArray(selectionRange) ? selectionRange : Object.keys(selectionRange);
  for (let i = 0; i < options.length; i++) {
    if (Array.isArray(selectionRange)) {
      optionEl = createOption(i, options[i]);
    } else {
      const key = options[i];
      const obj = selectionRange[key];
      if (!selectEl.multiple) obj.index = i + 1;  // store selection list index
      if (optPar && optPar.displayProp) displayProp = optPar.displayProp;
      else displayProp = keyProp;
      optionEl = createOption(key, obj[displayProp]);
      // if invoked with a selection argument, flag the selected options
      if (selectEl.multiple && optPar && optPar.selection &&
        optPar.selection[keyProp]) {
        // flag the option element with this value as selected
        optionEl.selected = true;
      }
    }
    selectEl.add(optionEl);
    console.log("done updating Direcor " + optionEl);
  }
}
//***************  M I S C  ****************************************
/**
* Retrieves the type of a value, either a data value of type "Number", "String" or "Boolean",
* or an object of type "Function", "Array", "HTMLDocument", ..., or "Object"
* @param {any} val
*/
function typeName(val) {
  // stringify val and extract the word following "object"
  var typeName = Object.prototype.toString.call(val).match(/^\[object\s(.*)\]$/)[1];
  // special case: null is of type "Null"
  if (val === null) return "Null";
  // special case: instance of a user-defined class or ad-hoc object
  if (typeName === "Object") return val.constructor.name || "Object";
  // all other cases: "Number", "String", "Boolean", "Function", "Array", "HTMLDocument", ...
  return typeName;
}
/**
 * Creates a clone of a data record object or extracts the data record part of an object
 * @param {object} obj
 */
function cloneRecord(obj) {
  var record = null;
  for (var p in obj) {
    if (obj.hasOwnProperty(p) && typeof obj[p] != "object" &&
      typeof obj[p] != "null" && typeof obj[p] != "undefined") {
      record[p] = obj[p];
    }
  }
  return record;
}
/**
 * Creates a typed "data clone" of an object
 * Notice that Object.getPrototypeOf(obj) === obj.__proto__
 * === Book.prototype when obj has been created by new Book(...)
 *
 * @param {object} obj
 */
function cloneObject(obj) {
  var clone = Object.create(Object.getPrototypeOf(obj));
  for (var p in obj) {
    if (obj.hasOwnProperty(p)) {
      if (typeof obj[p] === "number" ||
        typeof obj[p] === "string" ||
        typeof obj[p] === "boolean" ||
        typeName(obj[p]) === "Function" ||
        (typeName(obj[p]) === "Date" && obj[p] != null)) {
        clone[p] = obj[p];
      }
      // else clone[p] = cloneObject(obj[p]);
    }
  }
  return clone;
}
/**
 * Retrieve the direct supertype of a given class.
 * @author Gerd Wagner
 * @return {boolean}
 */
function getSuperType(Class) {
  return Class.prototype.__proto__.constructor
}

function createListFromMap(entityTbl, displayProp) {
  console.log("In List Map " + entityTbl);
  const listEl = document.createElement("ul");
  //console.log(entityTbl, displayProp);
  // delete old contents
  listEl.innerHTML = "";
  // create list items from object property values
  for (const key of Object.keys(entityTbl)) {
    console.log("In List Map forloop" + key);
    const listItemEl = document.createElement("li");
    listItemEl.textContent = entityTbl[key][displayProp];
    listEl.appendChild(listItemEl);
  }
  return listEl;
}
/**
 * Fill a Choice Set element with items
 *
 * @param {object} listEl  A list element
 * @param {object} selection  An entity table (map of objects)
 * @param {string} keyProp  The standard ID property of the entity table
 * @param {string} displayProp  A text property of the entity table
 */
function fillSelectedItemsList(listEl, selection, keyProp, displayProp) {
  // delete old contents
  listEl.innerHTML = "";
  for (const objId of Object.keys(selection)) {
    const obj = selection[objId];
    addItemToListOfSelectedItems(listEl, obj[keyProp], obj[displayProp]);
  }
}
// *************** Multi-Selection Widget ****************************************
/**
 * Create the contents of a Multi-Selection widget, which is a div containing
 * 1) a list of selected items, where each item has a delete button,
 * 2) a div containing a select element and an add button allowing to add a selected item
 *    to the selected items list
 *
 * @param {object} widgetContainerEl  The widget's container div
 * @param {object} selection  An entity table (map of objects)
 *                 for populating the list of selected objects
 * @param {object} selectionRange  An entity table (map of objects)
 *                 for populating the selection list
 * @param {string} keyProp  The standard identifier property of the range object type
 * @param {string} displayProp? Defines the property to be shown in the selection list
 * @param {string} minCard? The minimum cardinality of the list of selected objects
 */
function createMultiSelectionWidget(widgetContainerEl, selection, selectionRange,
  keyProp, displayProp, minCard) {
  const selectedItemsListEl = document.createElement("ul"),  // shows the selected objects
    selectEl = document.createElement("select");
  var el = null;
  if (!minCard) minCard = 0;  // default
  widgetContainerEl.innerHTML = "";  // delete old contents
  if (!displayProp) displayProp = keyProp;
  fillSelectedItemsList(selectedItemsListEl, selection, keyProp, displayProp);
  // event handler for removing an item from the selection
  selectedItemsListEl.addEventListener('click', function (e) {
    if (e.target.tagName === "BUTTON") {  // delete/undo button
      const btnEl = e.target,
        listItemEl = btnEl.parentNode,
        listEl = listItemEl.parentNode;
      if (listEl.children.length <= minCard) {
        alert("A Movie must have at least one actor!");
        return;
      }
      if (listItemEl.classList.contains("removed")) {
        // undoing a previous removal
        listItemEl.classList.remove("removed");
        // change button text
        btnEl.textContent = "✕";
      } else if (listItemEl.classList.contains("added")) {
        // removing a previously added item means moving it back to the selection range
        listItemEl.parentNode.removeChild(listItemEl);
        const optionEl = createOption(listItemEl.getAttribute("data-value"),
          listItemEl.firstElementChild.textContent);
        selectEl.add(optionEl);
      } else {
        // removing an ordinary item
        listItemEl.classList.add("removed");
        // change button text
        btnEl.textContent = "undo";
      }
    }
  });
  widgetContainerEl.appendChild(selectedItemsListEl);
  el = document.createElement("div");
  el.appendChild(selectEl);
  el.appendChild(createPushButton("add"));
  // event handler for moving an item from the selection range list to the selected items list
  selectEl.parentNode.addEventListener('click', function (e) {
    if (e.target.tagName === "BUTTON") {  // the add button was clicked
      if (selectEl.value) {
        addItemToListOfSelectedItems(selectedItemsListEl, selectEl.value,
          selectEl.options[selectEl.selectedIndex].textContent, "added");
        selectEl.remove(selectEl.selectedIndex);
        selectEl.selectedIndex = 0;
      }
    }
  });
  widgetContainerEl.appendChild(el);
  // create select options from selectionRange minus selection
  fillMultiSelectionListWithOptions(selectEl, selectionRange, keyProp,
    { "displayProp": displayProp, "selection": selection });
}

export { cloneObject, isIntegerOrIntegerString, fillSelectWithOptions, createListFromMap, createMultiSelectionWidget };
