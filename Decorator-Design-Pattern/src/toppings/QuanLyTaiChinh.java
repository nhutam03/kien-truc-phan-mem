package toppings;

public class QuanLyTaiChinh extends WorkDecorator {

	public QuanLyTaiChinh(Work workDecorated) {
		super(workDecorated);
		// TODO Auto-generated constructor stub
	}
	
	@Override
	public void doWork() {
		workDecorated.doWork();
		System.out.println("Ke toan truong: Quan ly tai chinh.");
	}

}
