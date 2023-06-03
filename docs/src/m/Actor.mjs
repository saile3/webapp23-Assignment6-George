/**
 * @fileOverview  The model class Actor with attribute definitions, (class-level) check methods, 
 *                setter methods, and the special methods saveAll and retrieveAll
 * @actor Gerd Wagner
 * @copyright Copyright 2013-2014 Gerd Wagner, Chair of Internet Technology, Brandenburg University of Technology, Germany. 
 * @license This code is licensed under The Code Project Open License (CPOL), implying that the code is provided "as-is", 
 * can be modified to create derivative works, can be redistributed, and can be used in commercial applications.
 */
import Person from "./Person.mjs";
import { cloneObject } from "../../lib/util.mjs";
import {
  NoConstraintViolation, MandatoryValueConstraintViolation,
  RangeConstraintViolation, UniquenessConstraintViolation
}
  from "../../lib/errorTypes.mjs";

/**
 * The class Actor
 * @class
 */
class Actor extends Person {
  // using a single record parameter with ES6 function parameter destructuring
  constructor({ personId, name, agent }) {
    super({ personId, name });  // invoke Person constructor
    // assign additional properties
    if (agent !== 0) this.agent = agent;
  }
  get agent() { return this._agent; }
  set agent(p) {
    if (!p) {  // unset director
      delete this._agent;
    } else {
      // p can be an ID reference or an object reference
      const person_id = (typeof p !== "object") ? p : Person.personId;
      const validationResult = Person.checkPersonIdAsIdRef(person_id);
      if (validationResult instanceof NoConstraintViolation) {
        // create the new director reference
        this._agent = Person.instances[person_id];
      } else {
        throw (validationResult + " : " + person_id);
      }
    }
  }  /***SIMPLIFIED CODE: no validation ***/
  toString() {
    return `Actor{ persID: ${this.personId}, name: ${this.name}, agent: ${this.agent} }`;
  }
  toJSON() {  // is invoked by JSON.stringify in Movie.saveAll
    var rec = {};
    for (const p of Object.keys(this)) {
      // copy only property slots with underscore prefix
      if (p.charAt(0) !== "_") continue;
      switch (p) {
        case "_agent":
          // convert object reference to ID reference
          if (this._agent) rec.agent = this._agent.personId;
          break;
        default:
          // remove underscore prefix
          rec[p.substr(1)] = this[p];
      }
    }
    return rec;
  }
}
/*****************************************************
 *** Class-level ("static") properties ***************
 *****************************************************/
// initially an empty collection (in the form of a map)
Actor.instances = {};
// add Actor to the list of Person subtypes
Person.subtypes.push(Actor);

/**********************************************************
 ***  Class-level ("static") storage management methods ***
 **********************************************************/
/**
 *  Create a new actor record
 */
Actor.add = function (slots) {
  var actor = null;
  try {
    actor = new Actor(slots);
  } catch (e) {
    console.log(`${e.constructor.name + ": " + e.message}`);
    actor = null;
  }
  if (actor) {
    Actor.instances[actor.personId] = actor;
    console.log(`Saved: ${actor.name}`);
  }
  Actor.saveAll();
};
/**
 *  Update an existing actor record
 */
Actor.update = function ({ personId, name, agent }) {
  const actor = Actor.instances[personId],
    objectBeforeUpdate = cloneObject(actor);
  var noConstraintViolated = true, updatedProperties = [];
  try {
    if (name && actor.name !== name) {
      actor.name = name;
      updatedProperties.push("name");
    }
    if (agent && actor.agent !== agent) {
      actor.agent = agent;
      updatedProperties.push("agent");
    }
  } catch (e) {
    console.log(e.constructor.name + ": " + e.message);
    noConstraintViolated = false;
    // restore object to its state before updating
    Actor.instances[personId] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      let ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log(`Propert${ending} ${updatedProperties.toString()} modified for actor ${name}`);
    } else {
      console.log(`No property value changed for actor ${name}!`);
    }
  }
};
/**
 *  Delete an existing actor record
 */
Actor.destroy = function (personId) {
  const actor = Actor.instances[personId];
  delete Actor.instances[personId];
  console.log(`Actor ${actor.name} deleted.`);
};
/**
 *  Retrieve all actor objects as records
 */
Actor.retrieveAll = function () {
  var actors = {};
  if (!localStorage["actors"]) localStorage["actors"] = "{}";
  try {
    actors = JSON.parse(localStorage["actors"]);
  } catch (e) {
    console.log("Error when reading from Local Storage\n" + e);
  }
  for (const key of Object.keys(actors)) {
    try {  // convert record to (typed) object
      Actor.instances[key] = new Actor(actors[key]);
      // create superclass extension
      Person.instances[key] = Actor.instances[key];
    } catch (e) {
      console.log(`${e.constructor.name} while deserializing actor ${key}: ${e.message}`);
    }
  }
  console.log(`${Object.keys(Actor.instances).length} Actor records loaded.`);
};

/**
 *  Save all actor objects as records
 */
Actor.saveAll = function () {
  console.log("In SaveAll " + Object.keys(Actor.instances).length);
  for (const key of Object.keys(Actor.instances)) {
    console.log(Actor.instances[key].name);
  }
  try {
    localStorage["actors"] = JSON.stringify(Actor.instances);
    console.log(Object.keys(Actor.instances).length + " actors saved.");
  } catch (e) {
    alert("Error when writing to Local Storage\n" + e);
  }
};

export default Actor;
