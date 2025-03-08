package toppings;

public class GanViec extends WorkDecorator {

	public GanViec(Work workDecorated) {
		super(workDecorated);
		// TODO Auto-generated constructor stub
	}
	
	@Override
	public void doWork() {
		workDecorated.doWork();
		 System.out.println("Doi truong: Gan viec cho nhan vien.");
	}

}
