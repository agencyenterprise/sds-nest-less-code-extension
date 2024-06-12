public class Nested {
  public static void main(String[] args) {
    firstLevel();
  }

  public static void firstLevel() {
    System.out.println("First level");
    if (true) {
      System.out.println("Second level");
      if (true) {
        System.out.println("Third level");
      }
    }
  }
}
