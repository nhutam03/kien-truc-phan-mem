package decorators;

import toppings.VanHanhMayMoc;
import toppings.WorkBasic;

public class NhanVienXuong extends Employee {

	public NhanVienXuong() {
		super(new VanHanhMayMoc(new WorkBasic()));
		// TODO Auto-generated constructor stub
	}

}
