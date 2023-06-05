/**
 * @fileOverview  View code of UI for managing Movie data
 * @author Gerd Wagner
 * @copyright Copyright 2013-2021 Gerd Wagner, Chair of Internet Technology, Brandenburg University of Technology, Germany.
 * @license This code is licensed under The Code Project Open License (CPOL), implying that the code is provided "as-is", 
 * can be modified to create derivative works, can be redistributed, and can be used in commercial applications.
 */
/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
import Movie, { MovieCategoryEL } from "../m/Movie.mjs";
import Person from "../m/Person.mjs";
import { displaySegmentFields, undisplayAllSegmentFields } from "./app.mjs"
import { fillSelectWithOptions, createListFromMap, createMultiSelectionWidget } from "../../lib/util.mjs";
import Actor from "../m/Actor.mjs";
import Director from "../m/Director.mjs";

/***************************************************************
 Load data
 ***************************************************************/
Movie.retrieveAll();
//if (Movie.instances !== null) console.log(Object.keys(Movie.instances));
Person.retrieveAll();

/***************************************************************
 Set up general, use-case-independent UI elements
 ***************************************************************/
/**
 * Setup User Interface
 */
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
  Movie.saveAll();
});

/**********************************************
 * Use case Retrieve/List Movies
**********************************************/
document.getElementById("RetrieveAndListAll")
  .addEventListener("click", function () {
    const tableBodyEl = document.querySelector("section#Movie-R > table > tbody");
    // reset view table (drop its previous contents)
    tableBodyEl.innerHTML = "";
    // populate view table
    for (const key of Object.keys(Movie.instances)) {
      const movie = Movie.instances[key];
      // create list of persons for this movie
      const authListEl = createListFromMap(movie.actors, "name");
      const row = tableBodyEl.insertRow();
      row.insertCell().textContent = movie.movieId;
      row.insertCell().textContent = movie.title;
      row.insertCell().textContent = movie.releaseDate;
      if (movie.category) {
        switch (movie.category) {
          case MovieCategoryEL.TVSERIESEPISODE:
            row.insertCell().textContent = "TV Series: " + movie.tvSeriesName + ", Episode: " + movie.episodeNo;
            break;
          case MovieCategoryEL.BIOGRAPHY:
            row.insertCell().textContent = "Biography of: " + movie.about;
            break;
        }
      } else {
        row.insertCell().textContent = movie.category;
      }
      //the movie director, show its name
      row.insertCell().textContent =
        movie.director ? movie.director.name : "";
      row.insertCell().appendChild(authListEl);
    }
    document.getElementById("Movie-M").style.display = "none";
    document.getElementById("Movie-R").style.display = "block";
  });

/**********************************************
 * Use case Create Movie
**********************************************/
const createFormEl = document.querySelector("section#Movie-C > form"),
  createCategorySelectEl = createFormEl.category,
  selectActorsEl = createFormEl["selectActors"],
  selectDirectorEl = createFormEl["selectDirector"];
//----- set up event handler for menu item "Create" -----------
document.getElementById("Create").addEventListener("click", function () {
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-C").style.display = "block";
  undisplayAllSegmentFields(createFormEl, MovieCategoryEL.labels);
  // set up a single selection list for selecting a Director
  fillSelectWithOptions(selectDirectorEl, Director.instances, "name");
  // set up a multiple selection list for selecting Actors
  fillSelectWithOptions(selectActorsEl, Actor.instances,
    "personId", { displayProp: "name" });
  createFormEl.reset();
});
// set up event handlers for responsive constraint validation
createFormEl.movieId.addEventListener("input", function () {
  createFormEl.movieId.setCustomValidity(
    Movie.checkMovieIdAsId(createFormEl.movieId.value).message);
});
createFormEl.tvSeriesName.addEventListener("input", function () {
  createFormEl.tvSeriesName.setCustomValidity(
    Movie.checkTvSeriesName(createFormEl.tvSeriesName.value,
      parseInt(createFormEl.category.value) + 1).message);
});
createFormEl.episodeNo.addEventListener("input", function () {
  createFormEl.episodeNo.setCustomValidity(
    Movie.checkEpisodeNo(createFormEl.episodeNo.value,
      parseInt(createFormEl.category.value) + 1).message);
});
createFormEl.about.addEventListener("input", function () {
  createFormEl.about.setCustomValidity(
    Movie.checkAbout(createFormEl.about.value,
      parseInt(createFormEl.category.value) + 1).message);
});
//director
/*selectDirectorEl.addEventListener("input", function () {
  selectDirectorEl.setCustomValidity(
    Movie.checkDirector(createFormEl["selectDirector"].selectedIndex).message);
});*/
//actor
selectActorsEl.addEventListener("input", function () {
  selectActorsEl.setCustomValidity(
    createFormEl.selectActors.selectedOptions.length > 0 ? "" : "No actor selected!");
});
/* SIMPLIFIED CODE: no responsive validation of title and Release Date */

// set up the movie category selection list
fillSelectWithOptions(createCategorySelectEl, MovieCategoryEL.labels);
createCategorySelectEl.addEventListener("change", handleCategorySelectChangeEvent);

// handle Save button click events
createFormEl["commit"].addEventListener("click", function () {
  const categoryStr = createFormEl.category.value;
  const slots = {
    movieId: createFormEl.movieId.value,
    title: createFormEl.title.value,
    releaseDate: createFormEl.releaseDate.value,
    actors: [],
    director: selectDirectorEl.options[selectDirectorEl.selectedIndex].value
  };
  if (categoryStr) {
    // enum literal indexes start with 1
    slots.category = parseInt(categoryStr) + 1;
    switch (slots.category) {
      case MovieCategoryEL.TVSERIESEPISODE:
        slots.tvSeriesName = createFormEl.tvSeriesName.value;
        createFormEl.tvSeriesName.setCustomValidity(
          Movie.checkTvSeriesName(createFormEl.tvSeriesName.value, slots.category).message);
        slots.episodeNo = createFormEl.episodeNo.value;
        createFormEl.episodeNo.setCustomValidity(
          Movie.checkEpisodeNo(createFormEl.episodeNo.value, slots.category).message);
        break;
      case MovieCategoryEL.BIOGRAPHY:
        slots.about = createFormEl.about.value;
        createFormEl.about.setCustomValidity(
          Movie.checkAbout(createFormEl.about.value, slots.category).message);
        break;
    }
  }
  // check all input fields and show error messages
  createFormEl.movieId.setCustomValidity(
    Movie.checkMovieIdAsId(slots.movieId).message);
  createFormEl.selectDirector.setCustomValidity(
    Movie.checkDirector(slots.director).message);
  // get the list of selected persons
  const selAuthOptions = createFormEl.selectActors.selectedOptions;
  // check the mandatory value constraint for persons
  createFormEl.selectActors.setCustomValidity(
    selAuthOptions.length > 0 ? "" : "No person selected!"
  );
  /* Incomplete code: no on-submit validation of "title" and "releaseDate" */
  // save the input data only if all form fields are valid

  if (createFormEl.checkValidity()) {
    // construct a list of person ID references
    for (const opt of selAuthOptions) {
      slots.actors.push(opt.value);
    }
    console.log("slots" + slots);
    Movie.add(slots);
    // un-render all segment/category-specific fields
    undisplayAllSegmentFields(createFormEl, MovieCategoryEL.labels);
  }
});

/**********************************************
 * Use case Update Movie
**********************************************/
const updateFormEl = document.querySelector("section#Movie-U > form"),
  updateSelectMovieEl = updateFormEl["selectMovie"],
  updateDirectorEl = updateFormEl["selectDirector"],
  updateSelectCategoryEl = updateFormEl["category"];
undisplayAllSegmentFields(updateFormEl, MovieCategoryEL.labels);
// handle click event for the menu item "Update"
document.getElementById("Update").addEventListener("click", function () {
  // reset selection list (drop its previous contents)
  updateSelectMovieEl.innerHTML = "";
  // populate the selection list
  fillSelectWithOptions(updateSelectMovieEl, Movie.instances,
    "movieId", { displayProp: "title" });
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-U").style.display = "block";
  updateFormEl.reset();
});
updateSelectMovieEl.addEventListener("change", handleMovieSelectChangeEvent);
// set up the movie category selection list
fillSelectWithOptions(updateSelectCategoryEl, MovieCategoryEL.labels);
updateSelectCategoryEl.addEventListener("change", handleCategorySelectChangeEvent);

/* Incomplete code: no responsive validation of "title" and "releaseDate" */
// responsive validation of form fields for segment properties
updateFormEl.tvSeriesName.addEventListener("input", function () {
  updateFormEl.tvSeriesName.setCustomValidity(
    Movie.checkTvSeriesName(updateFormEl.tvSeriesName.value,
      parseInt(updateFormEl.category.value) + 1).message);
});
updateFormEl.episodeNo.addEventListener("input", function () {
  updateFormEl.episodeNo.setCustomValidity(
    Movie.checkEpisodeNo(updateFormEl.episodeNo.value,
      parseInt(updateFormEl.category.value) + 1).message);
});

// handle Save button click events
updateFormEl["commit"].addEventListener("click", function () {
  const categoryStr = updateFormEl.category.value;
  const movieIdRef = updateSelectMovieEl.value;
  const selectPersonsWidget = updateFormEl.querySelector(".MultiSelectionWidget"),
    selectedPersonsListEl = selectPersonsWidget.firstElementChild;
  if (!movieIdRef) return;
  var slots = {
    movieId: updateFormEl.movieId.value,
    title: updateFormEl.title.value,
    releaseDate: updateFormEl.releaseDate.value,
    director_id: updateDirectorEl.options[updateDirectorEl.selectedIndex].value
  };
  if (categoryStr) {
    slots.category = parseInt(categoryStr) + 1;
    switch (slots.category) {
      case MovieCategoryEL.TVSERIESEPISODE:
        slots.tvSeriesName = updateFormEl.tvSeriesName.value;
        updateFormEl.tvSeriesName.setCustomValidity(
          Movie.checkTvSeriesName(slots.tvSeriesName, slots.category).message);
        slots.episodeNo = updateFormEl.episodeNo.value;
        updateFormEl.episodeNo.setCustomValidity(
          Movie.checkEpisodeNo(slots.episodeNo, slots.category).message);
        break;
      case MovieCategoryEL.BIOGRAPHY:
        slots.about = updateFormEl.about.value;
        updateFormEl.about.setCustomValidity(
          Movie.checkEpisodeNo(slots.about, slots.category).message);
        break;
    }
  }
  // check all input fields and show error messages
  updateFormEl.movieId.setCustomValidity(Movie.checkMovieId(slots.movieId).message);
  /* Incomplete code: no on-submit validation of "title" and "releaseDate" */
  // save the input data only if all form fields are valid
  if (createFormEl.checkValidity()) {
    // construct personIdRefs-ToAdd/ToRemove lists
    const personIdRefsToAdd = [], personIdRefsToRemove = [];
    for (const personItemEl of selectedPersonsListEl.children) {
      if (personItemEl.classList.contains("removed")) {
        personIdRefsToRemove.push(personItemEl.getAttribute("data-value"));
      }
      if (personItemEl.classList.contains("added")) {
        personIdRefsToAdd.push(personItemEl.getAttribute("data-value"));
      }
    }
    // if the add/remove list is non-empty, create a corresponding slot
    if (personIdRefsToRemove.length > 0) {
      slots.personIdRefsToRemove = personIdRefsToRemove;
    }
    if (personIdRefsToAdd.length > 0) {
      slots.personIdRefsToAdd = personIdRefsToAdd;
    }
    Movie.update(slots);
    // un-render all segment/category-specific fields
    undisplayAllSegmentFields(updateFormEl, MovieCategoryEL.labels);
    // update the movie selection list's option element
    updateSelectMovieEl.options[updateSelectMovieEl.selectedIndex].text = slots.title;
    // drop widget content
    selectPersonsWidget.innerHTML = "";
  }
});
/**
 * handle movie selection events
 * when a movie is selected, populate the form with the data of the selected movie
 */
function handleMovieSelectChangeEvent() {
  const movieId = updateFormEl.selectMovie.value,
    selectPersonsWidget = updateFormEl.querySelector(".MultiSelectionWidget"),
    selectDirectorEl = updateFormEl["selectDirector"];
  if (movieId) {
    const movie = Movie.instances[movieId];
    updateFormEl.movieId.value = movie.movieId;
    updateFormEl.title.value = movie.title;
    updateFormEl.releaseDate.value = movie.releaseDate;
    // set up the associated director selection list
    fillSelectWithOptions(selectDirectorEl, Director.instances, "name");
    // set up the associated actor selection widget
    createMultiSelectionWidget(selectPersonsWidget, movie.actors,
      Actor.instances, "personId", "name", 1);  // minCard=1
    // assign associated director as the selected option to select element
    if (movie.director) updateFormEl["selectDirector"].value = movie.director.name;
    if (movie.category) {
      updateFormEl.category.selectedIndex = movie.category;
      // disable category selection (category is frozen)
      updateFormEl.category.disabled = "disabled";
      // show category-dependent fields
      displaySegmentFields(updateFormEl, MovieCategoryEL.labels, movie.category);
      switch (movie.category) {
        case MovieCategoryEL.TVSERIESEPISODE:
          updateFormEl.tvSeriesName.value = movie.tvSeriesName;
          updateFormEl.episodeNo.value = movie.episodeNo;
          updateFormEl.about.value = "";
          break;
        case MovieCategoryEL.BIOGRAPHY:
          updateFormEl.about.value = movie.about;
          updateFormEl.tvSeriesName.value = "";
          break;
      }
    } else {  // movie has no value for category
      updateFormEl.category.value = "";
      updateFormEl.category.disabled = "";   // enable category selection
      updateFormEl.tvSeriesName.value = "";
      updateFormEl.episodeNo.value = "";
      updateFormEl.episodeNo.about = "";
      updateFormEl["selectDirector"].selectedIndex = 0;
      selectPersonsWidget.innerHTML = "";
      undisplayAllSegmentFields(updateFormEl, MovieCategoryEL.labels);
    }
  } else {
    updateFormEl.reset();
  }
};

/**********************************************
 * Use case Delete Movie
**********************************************/
const deleteFormEl = document.querySelector("section#Movie-D > form");
const delSelMovieEl = deleteFormEl.selectMovie;
// set up event handler for Update button
document.getElementById("Delete").addEventListener("click", function () {
  // reset selection list (drop its previous contents)
  delSelMovieEl.innerHTML = "";
  // populate the selection list
  fillSelectWithOptions(delSelMovieEl, Movie.instances,
    "movieId", { displayProp: "title" });
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-D").style.display = "block";
  deleteFormEl.reset();
});
// handle Delete button click events
deleteFormEl["commit"].addEventListener("click", function () {
  const movieIdRef = delSelMovieEl.value;
  if (!movieIdRef) return;
  if (confirm("Do you really want to delete this movie?")) {
    Movie.destroy(movieIdRef);
    delSelMovieEl.remove(delSelMovieEl.selectedIndex);
  }
});


/**********************************************
 * Refresh the Manage Movies Data UI
 **********************************************/
function refreshManageDataUI() {
  // show the manage movie UI and hide the other UIs
  document.getElementById("Movie-M").style.display = "block";
  document.getElementById("Movie-R").style.display = "none";
  document.getElementById("Movie-C").style.display = "none";
  document.getElementById("Movie-U").style.display = "none";
  document.getElementById("Movie-D").style.display = "none";
}

/**
 * event handler for movie category selection events
 * used both in create and update
 */
function handleCategorySelectChangeEvent(e) {
  const formEl = e.currentTarget.form,
    // the array index of MovieCategoryEL.labels
    categoryIndexStr = formEl.category.value;
  if (categoryIndexStr) {
    displaySegmentFields(formEl, MovieCategoryEL.labels,
      parseInt(categoryIndexStr) + 1);
  } else {
    undisplayAllSegmentFields(formEl, MovieCategoryEL.labels);
  }
}

// Set up Manage Movies UI
refreshManageDataUI();
