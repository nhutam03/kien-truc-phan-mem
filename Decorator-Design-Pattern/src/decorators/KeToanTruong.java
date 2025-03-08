package decorators;

import toppings.QuanLyTaiChinh;
import toppings.WorkBasic;

public class KeToanTruong extends Employee {

	public KeToanTruong() {
		super(new QuanLyTaiChinh(new WorkBasic()));
		// TODO Auto-generated constructor stub
	}

}
