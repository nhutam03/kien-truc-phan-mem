package decorators;

import toppings.PhaTra;
import toppings.PheDuyetGiayTo;
import toppings.WorkBasic;

public class NhanVienVP extends Employee {

	public NhanVienVP() {
		super(new PheDuyetGiayTo(new PhaTra(new WorkBasic())));
		// TODO Auto-generated constructor stub
	}

}
