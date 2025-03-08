package contexts;

import states.WorkState;

public class EmployeeContext {
	private WorkState state;

	public void setState(WorkState state) {
		this.state = state;
	}

	public void applyState() {
		this.state.doWork();
	}
	

}
