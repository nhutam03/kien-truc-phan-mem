package states;

import interfaces.State;

public class NhanVienXuong implements State {

	@Override
	public void handleRequest() {
		System.out.println("Đang ở trạng thái Nhân viên xưởng");
		
	}

}
