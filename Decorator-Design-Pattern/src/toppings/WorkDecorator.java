package toppings;

public class WorkDecorator implements Work {
	 protected Work workDecorated;

	    public WorkDecorator(Work workDecorated) {
	        this.workDecorated = workDecorated;
	    }

	@Override
	public void doWork() {
		workDecorated.doWork();
		
	}

}
