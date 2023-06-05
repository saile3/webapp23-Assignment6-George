/**
 * @fileOverview  The model class Movie with attribute definitions, (class-level) check methods, 
 *                setter methods, and the special methods saveAll and retrieveAll
 * @author Gerd Wagner
 * @copyright Copyright 2013-2021 Gerd Wagner, Chair of Internet Technology, Brandenburg University of Technology, Germany.
 * @license This code is licensed under The Code Project Open License (CPOL), implying that the code is provided "as-is", 
 * can be modified to create derivative works, can be redistributed, and can be used in commercial applications.
 */
import { cloneObject, isIntegerOrIntegerString } from "../../lib/util.mjs";
import Person from "./Person.mjs";
import {
  ConstraintViolation, FrozenValueConstraintViolation, MandatoryValueConstraintViolation,
  NoConstraintViolation, PatternConstraintViolation, RangeConstraintViolation,
  UniquenessConstraintViolation
} from "../../lib/errorTypes.mjs";
import { Enumeration } from "../../lib/Enumeration.mjs";
import Director from "./Director.mjs";
import Actor from "./Actor.mjs";
/**
 * Enumeration type
 * @global
 */
const MovieCategoryEL = new Enumeration(["Biography", "TvSeriesEpisode"]);
/**
 * Constructor function for the class Movie 
 * including the incomplete disjoint segmentation {TvSeriesEpisode, Biography}
 * @class
 */
class Movie {
  // using a single record parameter with ES6 function parameter destructuring
  constructor({ movieId, title, releaseDate, category, tvSeriesName, episodeNo, about, director, directorIdRefs,
    actors, actors_id }) {
    this.movieId = movieId;
    this.title = title;
    this.releaseDate = releaseDate;
    // optional properties
    if (category) this.category = category;  // from MovieCategoryEL
    if (tvSeriesName) this.tvSeriesName = tvSeriesName;
    if (episodeNo) this.episodeNo = episodeNo;
    if (about) this.about = about;
    // assign object references or ID references (to be converted in setter)
    this.director = director || directorIdRefs;
    if (actors || actors_id) {
      this.actors = actors || actors_id;
    }
  }
  get movieId() {
    return this._movieId;
  }
  static checkMovieId(movieId) {
    if (!movieId) return new NoConstraintViolation();
    else if (typeof movieId !== "string" || movieId.trim() === "" || isNaN(movieId)) {
      return new RangeConstraintViolation(
        "The Movie ID must be a non-empty Number!");
    } else {
      return new NoConstraintViolation();
    }
  }
  static checkMovieIdAsId(movieId) {
    var validationResult = Movie.checkMovieId(movieId);
    if ((validationResult instanceof NoConstraintViolation)) {
      if (!movieId) {
        validationResult = new MandatoryValueConstraintViolation(
          "A value for the Movie ID must be provided!");
      } else if (Movie.instances[movieId]) {
        validationResult = new UniquenessConstraintViolation(
          `There is already a movie record with Movie ID ${movieId}`);
      } else {
        validationResult = new NoConstraintViolation();
      }
    }
    return validationResult;
  }
  set movieId(movieId) {
    const validationResult = Movie.checkMovieIdAsId(movieId);
    if (validationResult instanceof NoConstraintViolation) {
      this._movieId = movieId;
    } else {
      throw validationResult;
    }
  }

  get title() {
    return this._title;
  }

  static checkTitle(title) {
    if (!title) {
      return new MandatoryValueConstraintViolation("A title must be provided!");
    } else if (title.trim() === "") {
      return new RangeConstraintViolation("The title must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  };

  set title(title) {
    const validationResult = Movie.checkTitle(title);
    if (validationResult instanceof NoConstraintViolation) {
      this._title = title;
    } else {
      throw validationResult;
    }
  }

  get releaseDate() {
    return this._releaseDate;
  }

  static checkReleaseDate(releaseDate) {
    if (!releaseDate || releaseDate === undefined
      || releaseDate === null || releaseDate.trim() === "") {
      return new MandatoryValueConstraintViolation("Release Date is Manditory");
    } else {
      return new NoConstraintViolation();
    }
  };

  set releaseDate(releaseDate) {
    const VALIDATION_RESULT = Movie.checkReleaseDate(releaseDate);
    if (VALIDATION_RESULT instanceof NoConstraintViolation) {
      this._releaseDate = releaseDate;
    } else {
      throw VALIDATION_RESULT;
    }
  }
  get category() { return this._category; }
  static checkCategory(c) {
    if (c === undefined) {
      return new NoConstraintViolation();  // category is optional
    } else if (!isIntegerOrIntegerString(c) || parseInt(c) < 1 ||
      parseInt(c) > MovieCategoryEL.MAX) {
      return new RangeConstraintViolation(
        `Invalid value for category: ${c}`);
    } else {
      return new NoConstraintViolation();
    }
  }
  set category(c) {
    var validationResult = null;
    if (this.category) {  // already set/assigned
      validationResult = new FrozenValueConstraintViolation(
        "The category cannot be changed!");
    } else {
      validationResult = Movie.checkCategory(c);
    }
    if (validationResult instanceof NoConstraintViolation) {
      this._category = parseInt(c);
    } else {
      throw validationResult;
    }
  }
  get tvSeriesName() { return this._tvSeriesName; }
  static checkTvSeriesName(sA, c) {
    const cat = parseInt(c);
    if (cat === MovieCategoryEL.TVSERIESEPISODE && !sA) {
      return new MandatoryValueConstraintViolation(
        "A Tv Series Name must be provided for a Tv Series!");
    } else if (cat !== MovieCategoryEL.TVSERIESEPISODE && sA) {
      return new ConstraintViolation("A Tv Series Name must not " +
        "be provided if its not a Tv Series!");
    } else if (sA && (typeof (sA) !== "string" || sA.trim() === "")) {
      return new RangeConstraintViolation(
        "The Tv Series Name must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  }
  set tvSeriesName(v) {
    const validationResult = Movie.checkTvSeriesName(v, this.category);
    if (validationResult instanceof NoConstraintViolation) {
      this._tvSeriesName = v;
    } else {
      throw validationResult;
    }
  }
  get episodeNo() { return this._episodeNo; }
  static checkEpisodeNo(a, c) {
    const cat = parseInt(c);
    if (cat === MovieCategoryEL.TVSERIESEPISODE && !a) {
      return new MandatoryValueConstraintViolation(
        "A Tv Series record must have an 'episodeNo' field!");
    } else if (cat !== MovieCategoryEL.TVSERIESEPISODE && a) {
      return new ConstraintViolation("An 'episodeNo' field value must not " +
        "be provided if its not a Tv Series!");
    } else if (a && (typeof (a) !== "string" || a.trim() === "")) {
      return new RangeConstraintViolation(
        "The 'episodeNo' field value must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  }
  set episodeNo(v) {
    const validationResult = Movie.checkEpisodeNo(v, this.category);
    if (validationResult instanceof NoConstraintViolation) {
      this._episodeNo = v;
    } else {
      throw validationResult;
    }
  }
  get about() { return this._about; }
  static checkAbout(a, c) {
    const cat = parseInt(c);
    if (cat === MovieCategoryEL.BIOGRAPHY && !a) {
      return new MandatoryValueConstraintViolation(
        "A Biography record must have an 'about' field!");
    } else if (cat !== MovieCategoryEL.BIOGRAPHY && a) {
      return new ConstraintViolation("An 'about' field value must not " +
        "be provided if its not a Biography!");
    } else if (a && (typeof (a) !== "string" || a.trim() === "")) {
      return new RangeConstraintViolation(
        "The 'about' field value must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  }
  set about(v) {
    const validationResult = Movie.checkAbout(v, this.category);
    if (validationResult instanceof NoConstraintViolation) {
      this._about = v;
    } else {
      throw validationResult;
    }
  }
  get director() {
    return this._director;
  }
  static checkDirector(directorId) {
    var validationResult = null;
    if (!directorId) {
      validationResult = new MandatoryValueConstraintViolation("The Movie Director value is manditory");
    } else {
      // invoke foreign key constraint check
      validationResult = Director.checkPersonIdAsIdRef(directorId);
    }
    return validationResult;
  }
  set director(director) {
    if (!director) {  // unset director
      delete this._director;
    } else {
      // p can be an ID reference or an object reference
      const director_id = (typeof director !== "object") ? director : director.personId;
      const validationResult = Movie.checkDirector(director_id);
      if (validationResult instanceof NoConstraintViolation) {
        this._director = Director.instances[director_id];
      } else {
        throw validationResult;
      }
    }
  }
  get actors() {
    return this._actors;
  }
  static checkActors(actorId) {
    var validationResult = null;
    if (!actorId) {
      validationResult = new MandatoryValueConstraintViolation("Movie Actor is manditory");
    } else {
      // invoke foreign key constraint check
      validationResult = Actor.checkPersonIdAsIdRef(actorId);
    }
    return validationResult;
  }
  addActors(actor) {
    // a can be an ID reference or an object reference
    const actors_id = (typeof actor !== "object") ? parseInt(actor) : actor.personId;
    if (actors_id) {
      const validationResult = Movie.checkActors(actors_id);
      if (actors_id && validationResult instanceof NoConstraintViolation) {
        // add the new person reference
        const key = String(actors_id);
        //Person.instances[key]._playedMovies[this._movieId] = this;
        this._actors[key] = Actor.instances[key];
      } else {
        throw validationResult;
      }
    }
  }
  removeActors(actor) {
    // a can be an ID reference or an object reference
    const actors_id = (typeof actor !== "object") ? parseInt(actor) : actor.personId;
    if (actors_id) {
      const validationResult = Movie.checkActors(actors_id);
      if (validationResult instanceof NoConstraintViolation) {
        // delete the person reference
        delete this._actors[String(actors_id)];
      } else {
        throw validationResult;
      }
    }
  }
  set actors(actor) {
    this._actors = {};
    if (Array.isArray(actor)) {  // array of IdRefs
      for (const idRef of actor) {
        this.addActors(idRef);
      }
    } else {  // map of IdRefs to object references
      for (const idRef of Object.keys(actor)) {
        this.addActors(actor[idRef]);
      }
    }
  }
  /*********************************************************
   ***  Other Instance-Level Methods  ***********************
   **********************************************************/
  /**toString() {
    console.log(this.movieId + " " + this.title + " " + this.releaseDate);
    var movieStr = `Movie{ movieId: ${this.movieId}, title: ${this.title}, releaseDate: ${this.releaseDate}, director: ${this.director}`;
    //if (this.director) movieStr += `, director: ${this.director}`;
    switch (this.category) {
      case MovieCategoryEL.TVSERIESEPISODE:
        movieStr += `, tvSeriesName: ${this.tvSeriesName}`;
        movieStr += `, episodeNo: ${this.episodeNo}`;
        break;
      case MovieCategoryEL.BIOGRAPHY:
        movieStr += `, biography episodeNo: ${this.episodeNo}`;
        break;
    }
    return `${movieStr}, actors: ${Object.keys(this.actors).join(",")} }`;
  }**/
  toString() {
    var movieStr = `Movie{ movieId: ${this.movieId}, title: ${this.title}, releaseDate: ${this.releaseDate}, director: ${this.director}`;
    //if (this.director) movieStr += `, director: ${this.director}`;
    return `${movieStr}, actors: ${Object.keys(this.actors).join(",")} }`;
  }
  /* Convert object to record */
  toJSON() { // is invoked by JSON.stringify in Movie.saveAll
    const rec = {};
    console.log("toJSON" + this);
    for (const p of Object.keys(this)) {
      // copy only property slots with underscore prefix
      if (p.charAt(0) !== "_") continue;
      switch (p) {
        case "_director":
          // convert object reference to ID reference
          if (this._director) rec.director = this._director.personId;
          break;
        case "_actors":
          // convert the map of object references to a list of ID references
          rec.actors_id = [];
          for (const personIdStr of Object.keys(this.actors)) {
            rec.actors_id.push(parseInt(personIdStr));
          }
          break;
        default:
          // remove underscore prefix
          rec[p.substr(1)] = this[p];
      }
    }
    return rec;
  }
}
/***********************************************
*** Class-level ("static") properties **********
************************************************/
// initially an empty collection (in the form of a map)
Movie.instances = {};

/************************************************
*** Class-level ("static") methods **************
*************************************************/
/**
 * Create a new Movie record
 * @method 
 * @static
 * @param {{movieId: string, title: string, releaseDate: number, category: ?number, tvSeriesName: ?string, episodeNo: ?string}} slots - A record of parameters.
 */
Movie.add = function (slots) {
  var movie = null;
  try {
    console.log(slots);
    movie = new Movie(slots);
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
    movie = null;
  }
  if (movie) {
    Movie.instances[movie.movieId] = movie;
    console.log(`${movie.toString()} created!`);
  }
};
/**
 * Update an existing Movie record
 * where the slots argument contains the slots to be updated and performing 
 * the updates with setters makes sure that the new values are validated
 * @method 
 * @static
 * @param {{movieId: string, title: string, releaseDate: number, category: ?number, tvSeriesName: ?string, episodeNo: ?string}} slots - A record of parameters.
 */
Movie.update = function ({ movieId, title, releaseDate, category, tvSeriesName, episodeNo }) {
  const movie = Movie.instances[movieId],
    objectBeforeUpdate = cloneObject(movie);
  var noConstraintViolated = true, updatedProperties = [];
  try {
    if (title && movie.title !== title) {
      movie.title = title;
      updatedProperties.push("title");
    }
    if (releaseDate && movie.releaseDate !== releaseDate) {
      movie.releaseDate = releaseDate;
      updatedProperties.push("releaseDate");
    }
    if (category) {
      if (movie.category === undefined) {
        movie.category = category;
        updatedProperties.push("category");
      } else if (category !== movie.category) {
        throw new FrozenValueConstraintViolation(
          "The movie category must not be changed!");
      }
    } else if (category === "" && "category" in movie) {
      throw new FrozenValueConstraintViolation(
        "The movie category must not be unset!");
    }
    if (tvSeriesName && movie.tvSeriesName !== tvSeriesName) {
      movie.tvSeriesName = tvSeriesName;
      updatedProperties.push("tvSeriesName");
    }
    if (episodeNo && movie.episodeNo !== episodeNo) {
      movie.episodeNo = episodeNo;
      updatedProperties.push("episodeNo");
    }
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
    noConstraintViolated = false;
    // restore object to its previous state (before updating)
    Movie.instances[movieId] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      let ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log(`Propert${ending} ${updatedProperties.toString()} modified for movie ${movieId}`);
    } else {
      console.log(`No property value changed for movie ${movie.toString()}!`);
    }
  }
};
/**
 * Delete an existing Movie record
 * @method 
 * @static
 * @param {string} movieId - The Movie ID of a movie.
 */
Movie.destroy = function (movieId) {
  if (Movie.instances[movieId]) {
    console.log(`${Movie.instances[movieId].toString()} deleted!`);
    delete Movie.instances[movieId];
  } else {
    console.log(`There is no movie with Movie ID ${movieId} in the database!`);
  }
};
/**
 * Load all movie table records and convert them to objects
 * Precondition: publishers and people must be loaded first
 * @method 
 * @static
 */
Movie.retrieveAll = function () {
  var movies = {};
  try {
    if (!localStorage["movies"]) {
      localStorage.setItem("movies", "{}");
    }
    else {
      movies = JSON.parse(localStorage["movies"]);
      console.log(Object.keys(movies).length + " movies loaded.");
    }
  } catch (e) {
    alert("Error when reading from Local Storage\n" + e);
  }
  for (const movieId of Object.keys(movies)) {
    //Movie.instances[movieId] = Movie.convertRec2Obj(movies[movieId]);
    try {
      console.log(movies[movieId]);
      Movie.instances[movieId] = new Movie(movies[movieId]);
    } catch (e) {
      console.log(`${e.constructor.name} while deserializing movie ${movieId}: ${e.message}`);
    }
  }
};
/**
 * Convert movie record to movie object
 * @method 
 * @static
 * @param {{movieId: string, title: string, releaseDate: number, category: ?number, tvSeriesName: ?string, episodeNo: ?string}} slots - A record of parameters.
 * @returns {object}
 */
Movie.convertRec2Obj = function (movieRow) {
  var movie = null;
  try {
    //for (let k of Object.keys(movieRow)) console.log("Rec20 " + k);
    movie = new Movie(movieRow);
  } catch (e) {
    console.log(`${e.constructor.name} while deserializing a movie record: ${e.message}`);
  }
  return movie;
};
/**
 * Save all Movie objects as records
 * @method 
 * @static
 */
Movie.saveAll = function () {
  const nmrOfMovies = Object.keys(Movie.instances).length;
  try {
    localStorage["movies"] = JSON.stringify(Movie.instances);
    console.log(`${nmrOfMovies} movie records saved.`);
  } catch (e) {
    alert("Error when writing to Local Storage\n" + e);
  }
};

export default Movie;
export { MovieCategoryEL };
