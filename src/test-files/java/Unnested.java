public class Unnested {
  public static void main(String[] args) {
    firstLevel();
  }

  public static void firstLevel() {
    System.out.println("First level");

    secondLevel();
  }

  public static void secondLevel() {
    System.out.println("Second level");

    thirdLevel();
  }

  public static void thirdLevel() {
    System.out.println("Third level");
  }
}
