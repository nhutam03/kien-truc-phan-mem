package main;

import contexts.EmployeeContext;
import states.DoiTruongState;
import states.GiamDocState;
import states.KeToanTruongState;
import states.NhanVienVPState;
import states.NhanVienXuong;

public class Main {
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		EmployeeContext context = new EmployeeContext();
		context.setState(new KeToanTruongState());
		context.applyState();

		context.setState(new DoiTruongState());
		context.applyState();
		
		context.setState(new GiamDocState());
		context.applyState();
		
		context.setState(new NhanVienVPState());
		context.applyState();
		
		context.setState(new NhanVienXuong());
		context.applyState();
	}
	
}
