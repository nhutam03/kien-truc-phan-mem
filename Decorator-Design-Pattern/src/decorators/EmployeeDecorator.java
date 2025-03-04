package decorators;

import interfaces.EmployeeComponent;

public abstract class EmployeeDecorator implements EmployeeComponent {
	protected EmployeeComponent employeeComponent;

	protected EmployeeDecorator(EmployeeComponent employeeComponent) {
		super();
		this.employeeComponent = employeeComponent;
	}
	
	@Override
	public String getName() {
		return employeeComponent.getName();
	}
}
