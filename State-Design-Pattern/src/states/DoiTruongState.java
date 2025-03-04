package states;

import interfaces.State;

public class DoiTruongState implements State {

	@Override
	public void handleRequest() {
		System.out.println("Đang ở trạng thái Đội trưởng");
		
	}

}
