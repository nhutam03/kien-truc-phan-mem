package coneretes;

import strategies.NhanVienVPStrategy;

public class NhanVienVP extends Employee {

	public NhanVienVP() {
		this.employeeStrategy = new NhanVienVPStrategy();
	}

}
