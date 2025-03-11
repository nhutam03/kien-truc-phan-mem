package leafs;

import components.Component;

public class Product implements Component {
	String name;
	double price;
	

	public Product(String name, double price) {
		super();
		this.name = name;
		this.price = price;
	}


	public String getName() {
		return name;
	}


	public void setName(String name) {
		this.name = name;
	}


	public void setPrice(double price) {
		this.price = price;
	}


	@Override
	public double getPrice() {
		// TODO Auto-generated method stub
		return price;
	}

}
