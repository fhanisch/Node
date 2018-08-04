// hello.js
const addon = require('./test');

console.log(addon.hello());
console.log(addon.getNumber());

var outObj={}
outObj.num=123
var strArr=["Huhu","Tach","Servus"]
outObj.strArr=strArr
var floatArr = new Float64Array([3.3,5.5, -22.34, 192.23, 0.3348])
outObj.floatArr = floatArr
var obj = addon.myObjects(outObj);
console.log(obj);