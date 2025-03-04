package toppings;

import decorators.EmployeeDecorator;
import interfaces.EmployeeComponent;

public class GiamDoc extends EmployeeDecorator {

	public GiamDoc(EmployeeComponent employeeComponent) {
		super(employeeComponent);
		// TODO Auto-generated constructor stub
	}

	@Override
	public void doTask() {
		employeeComponent.doTask();
		createRequirement();
		assignTask();
		manageProgress();
	}

	public void createRequirement() {
        System.out.println(this.employeeComponent.getName() + " is create requirements.");
    }
 
    public void assignTask() {
        System.out.println(this.employeeComponent.getName() + " is assigning tasks.");
    }
 
    public void manageProgress() {
        System.out.println(this.employeeComponent.getName() + " is managing the progress.");
    }

}
