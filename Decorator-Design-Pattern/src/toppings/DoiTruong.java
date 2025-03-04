package toppings;

import decorators.EmployeeDecorator;
import interfaces.EmployeeComponent;

public class DoiTruong extends EmployeeDecorator {

	public DoiTruong(EmployeeComponent employeeComponent) {
		super(employeeComponent);
		// TODO Auto-generated constructor stub
	}
	public void planing() {
        System.out.println(this.employeeComponent.getName() + " is planing.");
    }
 
    public void motivate() {
        System.out.println(this.employeeComponent.getName() + " is motivating his members.");
    }
 
    public void monitor() {
        System.out.println(this.employeeComponent.getName() + " is monitoring his members.");
    }

	@Override
	public void doTask() {
		employeeComponent.doTask();
		planing();
		motivate();
		monitor();
		
	}

}
