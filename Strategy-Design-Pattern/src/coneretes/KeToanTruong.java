package coneretes;

import strategies.KeToanTruongStrategy;

public class KeToanTruong extends Employee {

	public KeToanTruong() {
		this.employeeStrategy = new KeToanTruongStrategy();
	}

}
