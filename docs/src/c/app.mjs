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
    Movie.instances["0553345842"] = new Movie({
      isbn: "0553345842",
      title: "The Mind's I",
      year: 1982
    });
    Movie.instances["1463794762"] = new Movie({
      isbn: "1463794762",
      title: "The Critique of Pure Reason",
      year: 2011
    });
    Movie.instances["0631232826"] = new Movie({
      isbn: "0631232826",
      title: "Kant",
      year: 2001,
      category: MovieCategoryEL.TEXTBOOK,
      subjectArea: "Philosophy"
    });
    Movie.instances["0300029829"] = new Movie({
      isbn: "0300029829",
      title: "Kant's Life and Thoughts",
      year: 1983,
      category: MovieCategoryEL.BIOGRAPHY,
      about: "Immanuel Kant"
    });
    Movie.saveAll();
    Employee.instances["1001"] = new Employee({
      personId: 1001,
      name: "Harry Wagner",
      empNo: 21035
    });
    Employee.instances["1002"] = new Employee({
      personId: 1002,
      name: "Peter Boss",
      empNo: 23107,
      category: EmployeeCategoryEL.MANAGER,
      department: "Marketing"
    });
    Employee.saveAll();
    Author.instances["1001"] = new Author({
      personId: 1001,
      name: "Harry Wagner",
      biography: "Born in Boston, MA, in 1956, ..."
    });
    Author.instances["1077"] = new Author({
      personId: 1077,
      name: "Immanuel Kant",
      biography: "Immanuel Kant (1724-1804) was a German philosopher ..."
    });
    Author.saveAll();
    // an example of a person that is neither an employee, nor an author
    Person.instances["1003"] = new Person({
      personId: 1003,
      name: "Tom Daniels"
    });
    Person.saveAll();
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
