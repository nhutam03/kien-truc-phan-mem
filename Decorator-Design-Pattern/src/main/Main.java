package main;

import java.util.Scanner;

import decorators.DoiTruong;
import decorators.Employee;
import decorators.GiamDoc;
import decorators.KeToanTruong;
import decorators.NhanVienVP;
import decorators.NhanVienXuong;

public class Main {
	public static void main(String[] args) {
		 Scanner scanner = new Scanner(System.in);
	        Employee nhanVien = null;
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
	                    nhanVien = new DoiTruong();
	                    break;
	                case 2:
	                    nhanVien = new GiamDoc();
	                    break;
	                case 3:
	                    nhanVien = new NhanVienVP();
	                    break;
	                case 4:
	                    nhanVien = new NhanVienXuong();
	                    break;
	                case 5:
	                    nhanVien = new KeToanTruong();
	                    break;
	                case 0:
	                    running = false;
	                    System.out.println("Thoat chuong trinh.");
	                    continue;
	                default:
	                    System.out.println("Lua chon khong hop le! Vui long nhap lai.");
	                    continue;
	            }

	            if (nhanVien != null) {
	                nhanVien.performWork();;
	            }
	        }

	        scanner.close();
	}
}
