package main;

import entities.EmployeeConcreteComponent;
import interfaces.EmployeeComponent;
import toppings.DoiTruong;
import toppings.GiamDoc;
import toppings.KeToanTruong;
import toppings.NhanVienVP;

public class Main {
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		System.out.println("NORMAL EMPLOYEE: ");
        EmployeeComponent employee = new EmployeeConcreteComponent("GPCoder");
        employee.doTask();
 
        System.out.println("\nTEAM LEADER: ");
        EmployeeComponent teamLeader = new DoiTruong(employee);
        teamLeader.doTask();
 
        System.out.println("\nMANAGER: ");
        EmployeeComponent manager = new GiamDoc(employee);
        manager.doTask();
 
        System.out.println("\nNORMAL EMPLOYEE 1: ");
        EmployeeComponent employee1 = new NhanVienVP(employee);
        employee1.doTask();
        
        System.out.println("\nNORMAL EMPLOYEE 2: ");
        EmployeeComponent employee2 = new NhanVienVP(employee);
        employee2.doTask();
        
        System.out.println("\nMANAGER ACCOUNT: ");
        EmployeeComponent account = new KeToanTruong(employee);
        account.doTask();
	}
}
