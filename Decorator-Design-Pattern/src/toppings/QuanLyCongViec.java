package toppings;

public class QuanLyCongViec extends WorkDecorator {

	public QuanLyCongViec(Work workDecorated) {
		super(workDecorated);
		// TODO Auto-generated constructor stub
	}
	
	@Override
	public void doWork() {
		workDecorated.doWork();
		System.out.println("Giam doc: Quan ly cong ty, dua ra quyet dinh chien luoc.");
	}

}
