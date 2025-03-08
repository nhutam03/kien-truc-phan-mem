package main;

import java.util.Scanner;

import coneretes.DoiTruong;
import coneretes.Employee;
import coneretes.GiamDoc;
import coneretes.KeToanTruong;
import coneretes.NhanVienVP;
import coneretes.NhanVienXuong;
import strategies.DoiTruongStrategy;
import strategies.GiamDocStrategy;

public class Main {
	public static void main(String[] args) {
		Scanner scanner = new Scanner(System.in);
		Employee employee = null;
		boolean running = true;

		while (running) {
			System.out.println("\n--- MENU LỰA CHỌN CHỨC VỤ ---");
			System.out.println("1. Đội Trưởng");
			System.out.println("2. Giám Đốc");
			System.out.println("3. Nhân Viên Văn Phòng");
			System.out.println("4. Nhân Viên Xưởng");
			System.out.println("5. Kế Toán Trưởng");
			System.out.println("0. Thoát");
			System.out.print("Chọn chức vụ (0-5): ");

			int choice = scanner.nextInt();
			scanner.nextLine(); // Xử lý dòng thừa

			switch (choice) {
			case 1:
				employee = new DoiTruong();
				break;
			case 2:
				employee = new GiamDoc();
				break;
			case 3:
				employee = new NhanVienVP();
				break;
			case 4:
				employee = new NhanVienXuong();
				break;
			case 5:
				employee = new KeToanTruong();
				break;
			case 0:
				running = false;
				System.out.println("Thoát chương trình.");
				continue;
			default:
				System.out.println("Lựa chọn không hợp lệ! Vui lòng nhập lại.");
				continue;
			}

			if (employee != null) {
				employee.performWork();
			}
		}

		scanner.close();
	}
}
