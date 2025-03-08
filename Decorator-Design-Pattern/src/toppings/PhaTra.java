package toppings;

public class PhaTra extends WorkDecorator {

	public PhaTra(Work workDecorated) {
		super(workDecorated);
		// TODO Auto-generated constructor stub
	}
	
	@Override
	public void doWork() {
		workDecorated.doWork();
		System.out.println("Nhan vien VP: Pha tra.");
	}

}
