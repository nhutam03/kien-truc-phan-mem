package toppings;

public class DiTuan extends WorkDecorator {

	public DiTuan(Work workDecorated) {
		super(workDecorated);
		// TODO Auto-generated constructor stub
	}
	
	@Override
	public void doWork() {
		workDecorated.doWork();
		 System.out.println("Doi truong: Di tuan tra.");
	}

}
