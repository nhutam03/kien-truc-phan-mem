package entities;

import interfaces.EmployeeComponent;

public class EmployeeConcreteComponent implements EmployeeComponent {
	private String name;
	

	public EmployeeConcreteComponent(String name) {
		super();
		this.name = name;
	}

	
	public void setName(String name) {
		this.name = name;
	}


	@Override
	public String getName() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void doTask() {
		// TODO Auto-generated method stub
		
	}
	

}
