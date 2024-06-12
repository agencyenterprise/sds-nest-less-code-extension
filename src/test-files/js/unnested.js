function firstLevel() {
  console.log("First level");
  function secondLevel() {
    console.log("Second level");
  }
  secondLevel();
}
firstLevel();
