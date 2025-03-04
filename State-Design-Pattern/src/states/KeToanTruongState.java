package states;

import interfaces.State;

public class KeToanTruongState implements State {
	public void handleRequest() {
		System.out.println("Đang ở trạng thái Kế toán trưởng");
	}
}
