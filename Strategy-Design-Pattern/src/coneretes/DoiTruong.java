package coneretes;

import strategies.DoiTruongStrategy;

public class DoiTruong extends Employee{

	public DoiTruong() {
		this.employeeStrategy = new DoiTruongStrategy();
	}
	

}
