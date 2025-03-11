package main;

import observers.Student;
import subjects.ClassMonitor;

public class Main {
	public static void main(String[] args) {
		Student student1 = new Student();
		student1.setName("Nhu Tam");
		Student student2 = new Student();
		student2.setName("Nhu Ngoc");
		Student student3 = new Student();
		student3.setName("Nhu Nguyet");

		ClassMonitor monitor = new ClassMonitor();
		System.out.println("Attach student 1 to monitor: ");
		monitor.attach(student1);
		System.out.println("Attach student 2 to monitor: ");
		monitor.attach(student2);
		System.out.println("Attach student 3 to monitor: ");
		monitor.attach(student3);

		System.out.println("Noti to everyone: ");
		monitor.notification();
	}
}
