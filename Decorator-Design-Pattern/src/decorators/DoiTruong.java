package decorators;

import toppings.DiTuan;
import toppings.GanViec;
import toppings.WorkBasic;

public class DoiTruong extends Employee {

	public DoiTruong() {
		super(new GanViec(new DiTuan(new WorkBasic())));
		// TODO Auto-generated constructor stub
	}

}
