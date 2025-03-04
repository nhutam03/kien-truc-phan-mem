package toppings;

import decorators.EmployeeDecorator;
import interfaces.EmployeeComponent;

public class KeToanTruong extends EmployeeDecorator {

	public KeToanTruong(EmployeeComponent employeeComponent) {
		super(employeeComponent);
		// TODO Auto-generated constructor stub
	}
	
	public void check() {
		System.out.println(this.employeeComponent.getName() + " is checking his assigned tasks.");
	}
	
	public void verify() {
		System.out.println(this.employeeComponent.getName() + " is verifying his assigned tasks.");
	}

	@Override
	public void doTask() {
		employeeComponent.doTask();
		check();
		verify();
		
	}

}
