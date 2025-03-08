package coneretes;

import strategies.NhanVienXuongStrategy;

public class NhanVienXuong extends Employee {

	public NhanVienXuong() {
		this.employeeStrategy = new NhanVienXuongStrategy();
	}
	
}
