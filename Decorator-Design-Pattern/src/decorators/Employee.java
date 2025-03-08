package decorators;

import toppings.Work;

public abstract class Employee {
	protected Work work;

	protected Employee(Work work) {
		super();
		this.work = work;
	}
	
	public void performWork() {
		work.doWork();
	}
}
