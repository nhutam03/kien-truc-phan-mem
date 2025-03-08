package states;

public class DoiTruongState implements WorkState {


	@Override
	public void doWork() {
		System.out.println("Doi truong: Di tuan tra.");
        System.out.println("Doi truong: Gan viec cho nhan vien.");
	}

}
