package toppings;

public class VanHanhMayMoc extends WorkDecorator {

	public VanHanhMayMoc(Work workDecorated) {
		super(workDecorated);
		// TODO Auto-generated constructor stub
	}
	
	@Override
	public void doWork() {
		workDecorated.doWork();
		 System.out.println("Nhan vien Xuong: Van hanh may moc.");
	}

}
