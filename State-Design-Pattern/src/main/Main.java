package main;

import java.util.Scanner;

import contexts.EmployeeContext;
import states.DoiTruongState;
import states.GiamDocState;
import states.KeToanTruongState;
import states.NhanVienVPState;
import states.NhanVienXuongState;

public class Main {
	public static void main(String[] args) {
		 Scanner scanner = new Scanner(System.in);
	        EmployeeContext nhanVien = new EmployeeContext();
	        boolean running = true;

	        while (running) {
	            System.out.println("\n--- MENU LỰA CHỌN CHỨC VỤ ---");
	            System.out.println("1. Doi Truong");
	            System.out.println("2. Giam Doc");
	            System.out.println("3. Nhan Vien Van Phong");
	            System.out.println("4. Nhan Vien Xuong");
	            System.out.println("5. Ke Toan Truong");
	            System.out.println("0. Thoat");
	            System.out.print("Chon chuc vu (0-5): ");

	            int choice = scanner.nextInt();
	            scanner.nextLine(); 

	            switch (choice) {
	                case 1:
	                    nhanVien.setState(new DoiTruongState());
	                    break;
	                case 2:
	                    nhanVien.setState(new GiamDocState());
	                    break;
	                case 3:
	                    nhanVien.setState(new NhanVienVPState());
	                    break;
	                case 4:
	                    nhanVien.setState(new NhanVienXuongState());
	                    break;
	                case 5:
	                    nhanVien.setState(new KeToanTruongState());
	                    break;
	                case 0:
	                    running = false;
	                    System.out.println("Thoat chuong trinh.");
	                    continue;
	                default:
	                    System.out.println("Lua chon khong hop le! Vui long nhap lai.");
	                    continue;
	            }

	            nhanVien.applyState();;
	        }

	        scanner.close();
	}
	
}
