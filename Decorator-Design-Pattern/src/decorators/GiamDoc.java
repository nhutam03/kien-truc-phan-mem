package decorators;

import toppings.QuanLyCongViec;
import toppings.WorkBasic;

public class GiamDoc extends Employee {

	public GiamDoc() {
		super(new QuanLyCongViec(new WorkBasic()));
		// TODO Auto-generated constructor stub
	}

}
