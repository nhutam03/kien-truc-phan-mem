package entities;

import java.util.ArrayList;
import java.util.List;

import enums.Role;

public class Employee {
	private int id;
	private String name;
	private Role role;
	private List<String> request;
	
	public Employee(int id, String name, Role role) {
		this.id = id;
		this.name = name;
		this.role = role;
		this.request = new ArrayList<String>();
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Role getRole() {
		return role;
	}

	public void setRole(Role role) {
		this.role = role;
	}
	
	public List<String> getRequest() {
		return request;
	}

	public void setRequest(List<String> request) {
		this.request = request;
	}

	public void handleRequest() {
		if (role == Role.DoiTruong) {
			request.add("Huong dan xu ly yeu cau");
			request.add("Phan cong nhan vien xu ly yeu cau");
		} else if (role == Role.GiamDoc) {
			request.add("Giam doc xu ly yeu cau");
			request.add("Chi tien cho KTT");
		} else if (role == Role.NhanVienVP) {
			request.add("Nhan vien VP xu ly yeu cau");
			request.add("Len PV dong gio");
		} else if (role == Role.NhanVienXuong) {
			request.add("Nhan vien xuong xu ly yeu cau");
			request.add("Kiem kho, kiem xuong");
		} else if (role == Role.KeToanTruong) {
			request.add("Ke toan truong xu ly yeu cau");
			request.add("Xac nhan so lieu");
			request.add("Chuyen tien");
		}
	}
}
