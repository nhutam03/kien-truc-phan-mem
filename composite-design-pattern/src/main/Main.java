package main;

import client.CoffeeShop;
import composites.Table;
import leafs.Product;

public class Main {
	public static void main(String[] args) {
		Product product1 = new Product("Cà phê muối", 55000);
		Product product2 = new Product("Cà phê sữa dừa", 55000);
		Product product3 = new Product("Trà đào", 50000);
		Product product4 = new Product("Cà phê kem", 60000);
		
		Table table1 = new Table();
		Table table2 = new Table();
		Table table3 = new Table();
		table1.add(product1);
		System.out.println("Table 1: " + table1.getPrice());
		table2.add(product1);
		table2.add(product2);
		System.out.println("Table 2: " + table2.getPrice());
		table3.add(product1);
		table3.add(product2);
		table3.add(product3);
		System.out.println("Table 3: " + table3.getPrice());
		
		CoffeeShop coffeeShop = new CoffeeShop();
		coffeeShop.add(table1);
		coffeeShop.add(table2);
		coffeeShop.add(table3);
		
		System.out.println("Total price: " + coffeeShop.getTotalRevenue());
		
	}
}
