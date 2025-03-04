package toppings;

import decorators.EmployeeDecorator;
import interfaces.EmployeeComponent;

public class NhanVienXuong extends EmployeeDecorator {

	public NhanVienXuong(EmployeeComponent employeeComponent) {
		super(employeeComponent);
		// TODO Auto-generated constructor stub
	}
	
	public void follow() {
		System.out.println(this.employeeComponent.getName() + " is following his assigned tasks.");
	}

	public void report() {
		System.out.println(this.employeeComponent.getName() + " is reporting his assigned tasks.");
	}

	@Override
	public void doTask() {
		employeeComponent.doTask();
		follow();
		report();
		
	}

}
