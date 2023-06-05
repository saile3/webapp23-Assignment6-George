/**
 * @fileOverview  App-level controller code
 * @author Gerd Wagner
 */
import Person from "../m/Person.mjs";
import Actor from "../m/Actor.mjs";
import Director from "../m/Director.mjs";
import Movie, { MovieCategoryEL } from "../m/Movie.mjs";

/*******************************************
 *** Auxiliary methods for testing **********
 ********************************************/
/**
 *  Create and save test data
 */
function generateTestData() {
  try {

    /*
Movie.instances["1"] = new Movie({
      movieId: "1",
      title: "Pulp Fiction",
      releaseDate: 1994-05-12,
      category:"",
      tvSeriesName:"",
      episodeNo:"",
      about:"",
      directorIdRefs:"3",
      actors_id:[3,4,5]
    });
    Movie.instances["1"] = new Movie({
      movieId: "1",
      title: "Pulp Fiction",
      releaseDate: "1994-05-12",
      directorIdRefs: 3,
      actors_id: [3, 4, 5]
    });

    Movie.saveAll();
*/

    // an example of a person that is neither an employee, nor an author
    Person.instances["14"] = new Person({
      personId: 14,
      name: "John Forbes Nash"
    });
    Person.instances["15"] = new Person({
      personId: 15,
      name: "John Doe"
    });
    Person.instances["16"] = new Person({
      personId: 16,
      name: "John Doe"
    });
    Person.saveAll();

    //Director
    Director.instances["1"] = new Director({
      personId: 1,
      name: "Stephen Frears"
    });
    Director.instances["2"] = new Director({
      personId: 2,
      name: "George Lucas"
    });
    Director.instances["3"] = new Director({
      personId: 3,
      name: "Quentin Tarantino"
    });
    Director.instances["9"] = new Director({
      personId: 9,
      name: "Russell Crowe"
    });
    Director.instances["13"] = new Director({
      personId: 13,
      name: "Marc Forster"
    });
    Director.saveAll();

    //Actor
    Actor.instances["3"] = new Actor({
      personId: 3,
      name: "Quentin Tarantino",
      agent: ""
    });
    Actor.instances["4"] = new Actor({
      personId: 4,
      name: "Uma Thurman",
      agent: "15"
    });
    Actor.instances["5"] = new Actor({
      personId: 5,
      name: "John Travolta",
      agent: ""
    });
    Actor.instances["6"] = new Actor({
      personId: 6,
      name: "Ewan McGregor",
      agent: ""
    });
    Actor.instances["7"] = new Actor({
      personId: 7,
      name: "Natalie Portman",
      agent: ""
    });
    Actor.instances["8"] = new Actor({
      personId: 8,
      name: "Keanu Reeves",
      agent: "16"
    });
    Actor.instances["9"] = new Actor({
      personId: 9,
      name: "Russell Crowe",
      agent: "16"
    });
    Actor.instances["10"] = new Actor({
      personId: 10,
      name: "Seth MacFarlane",
      agent: ""
    });
    Actor.instances["11"] = new Actor({
      personId: 11,
      name: "Naomi Watts",
      agent: ""
    });
    Actor.instances["12"] = new Actor({
      personId: 12,
      name: "Ed Harris",
      agent: "15"
    });
    Actor.saveAll();
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
  }
}
/**
 * Clear data
 */
function clearData() {
  if (confirm("Do you really want to delete the entire database?")) {
    try {
      [Director, Actor, Person, Movie].forEach(Class => {
        Class.instances = {};
      });
      /*
          Employee.instances = {};
          Author.instances = {};
          Person.instances = {};
          Movie.instances = {};
      */
      localStorage["directors"] = localStorage["actors"] = localStorage["person"] = "{}";
      localStorage["movies"] = "{}";
      console.log("All data cleared.");
    } catch (e) {
      console.log(`${e.constructor.name}: ${e.message}`);
    }
  }
}

export { generateTestData, clearData };
