package observers;

public class Student implements Observer {
	String name;
	

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@Override
	public void update() {
		System.out.println("Student " + name + " is notified.");
    }
}
