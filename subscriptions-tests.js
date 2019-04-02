// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by credits.js.
import { name as packageName } from "meteor/mozfet:credits";

// Write your tests here!
// Here is an example.
Tinytest.add('credits - example', function (test) {
  test.equal(packageName, "subscriptions");
});
