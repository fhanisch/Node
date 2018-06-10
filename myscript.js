function Person(vorname,nachname,alter,hobby)
{
    this.vorname=vorname
    this.nachname=nachname
    this.fullname=vorname + " " + nachname
    this.alter=alter
    this.hobby=hobby
    this.getFullName = function(){return this.fullname}
}

var ich = new Person("Max","Mustermann",50,"Klöppeln")

console.log(ich)
console.log(ich.getFullName())
