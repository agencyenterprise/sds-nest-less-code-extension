function firstLevel() {
  console.log("First level");
  function secondLevel() {
    console.log("Second level");
    function thirdLevel() {
      console.log("Third level");
      function fourthLevel() {
        console.log("Fourth level");
      }
      fourthLevel();
    }
    thirdLevel();
  }
  secondLevel();
}
firstLevel();
