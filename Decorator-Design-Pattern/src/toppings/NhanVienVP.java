package toppings;

import decorators.EmployeeDecorator;
import interfaces.EmployeeComponent;

public class NhanVienVP extends EmployeeDecorator {

	public NhanVienVP(EmployeeComponent employeeComponent) {
		super(employeeComponent);
		// TODO Auto-generated constructor stub
	}
	public void reportTask() {
        System.out.println(this.employeeComponent.getName() + " is reporting his assigned tasks.");
    }
 
    public void coordinateWithOthers() {
        System.out.println(this.employeeComponent.getName() + " is coordinating with other members of his team.");
    }

	@Override
	public void doTask() {
		employeeComponent.doTask();
        reportTask();
        coordinateWithOthers();
		
	}

}
