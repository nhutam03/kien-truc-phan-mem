package states;

import interfaces.State;

public class GiamDocState implements State {

	@Override
	public void handleRequest() {
		System.out.println("Đang ở trạng thái Giám đốc");
		
	}

}
