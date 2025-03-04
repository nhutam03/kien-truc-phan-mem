package contexts;

import interfaces.State;

public class EmployeeContext {
	private State state;

	public void setState(State state) {
		this.state = state;
	}

	public void applyState() {
		this.state.handleRequest();
	}
	

}
