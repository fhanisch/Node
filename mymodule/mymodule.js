//var addon = require('./build/Release/mymodule');
var addon = require('./test');

var Person = {};
Person.name = 'Knecht Ruprecht';

var test = {};
test.timestwo=function(x) {return 2*x};

console.log(addon.myFunction());
console.log(addon.timesTwo(12.5));
var obj = addon.myObject();
console.log(obj.myProp);
console.log(obj.Vorname);
console.log(obj.doublearr);
console.log(addon);
var x = new Float64Array(obj.doublearr, 0, 5);
console.log(x);

Person.strarr = ["juhu", "jippi", "guten tag"];
console.log(Person.strarr);
addon.readObject(Person);

console.log(test.timestwo(7));

var f=test.timestwo;

console.log(f(100));