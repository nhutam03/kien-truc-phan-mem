package coneretes;

import strategies.GiamDocStrategy;

public class GiamDoc extends Employee {

	public GiamDoc() {
		this.employeeStrategy = new GiamDocStrategy();
	}

}
