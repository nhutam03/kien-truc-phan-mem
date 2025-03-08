package toppings;

public class PheDuyetGiayTo extends WorkDecorator {

	public PheDuyetGiayTo(Work workDecorated) {
		super(workDecorated);
		// TODO Auto-generated constructor stub
	}
	
	@Override
	public void doWork() {
		workDecorated.doWork();
		System.out.println("Nhan vien VP: Phe duyet giay to.");
	}

}
