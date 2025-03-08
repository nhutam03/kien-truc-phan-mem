package coneretes;

import strategies.EmployeeStrategy;

public class Employee {
	protected EmployeeStrategy employeeStrategy;
	
	public void setWorkStrategy(EmployeeStrategy employeeStrategy) {
        this.employeeStrategy = employeeStrategy;
    }
	public void performWork() {
		if (employeeStrategy != null) {
			employeeStrategy.doWork();
		} else {
			System.out.println("EmployeeStrategy is null");
		}
	}
}
