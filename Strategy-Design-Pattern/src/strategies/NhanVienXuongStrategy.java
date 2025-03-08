package strategies;

public class NhanVienXuongStrategy implements EmployeeStrategy {

	@Override
	public void doWork() {
		System.out.println("Nhân viên Xưởng: Vận hành máy móc, sản xuất hàng hóa.");
	}

}
