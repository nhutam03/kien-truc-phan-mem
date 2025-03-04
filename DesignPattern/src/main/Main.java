package main;

import entities.Employee;
import enums.Role;

public class Main {
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		Employee employee = new Employee(1, "Nguyen Van A", Role.DoiTruong);
		
		employee.setRole(Role.GiamDoc);
		employee.handleRequest();
		System.out.println(employee.getRole().getValue() +": " + employee.getRequest());

		employee.setRole(Role.NhanVienVP);
		employee.handleRequest();
		System.out.println(employee.getRole().getValue() +": " + employee.getRequest());
		employee.setRole(Role.NhanVienXuong);
		employee.handleRequest();

		System.out.println(employee.getRole().getValue() +": " + employee.getRequest());
		employee.setRole(Role.KeToanTruong);
		employee.handleRequest();
		System.out.println(employee.getRole().getValue() +": " + employee.getRequest());
	}

}
