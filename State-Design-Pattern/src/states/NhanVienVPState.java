package states;

import interfaces.State;

public class NhanVienVPState implements State {

	@Override
	public void handleRequest() {
		System.out.println("Đang ở trạng thái Nhân viên văn phòng");
		
	}

}
