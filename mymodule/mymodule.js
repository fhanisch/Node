var addon = require('./build/Release/mymodule');

var Person = {};
Person.name = 'Knecht Ruprecht';

var test = {};
test.timestwo=function(x) {return 2*x};

console.log(addon.myFunction());
console.log(addon.timesTwo(12.5));
var obj = addon.myObject();
console.log(obj.myProp);
console.log(obj.Vorname);
console.log(addon);

addon.readObject(Person);

console.log(test.timestwo(7));

var f=test.timestwo;

console.log(f(100));