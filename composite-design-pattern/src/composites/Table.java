package composites;

import java.util.ArrayList;
import java.util.List;

import components.Component;

public class Table implements Component {
	List<Component> products = new ArrayList<Component>();

	public void add(Component product) {
        products.add(product);
    }

    @Override
    public double getPrice() {
        return products.stream().mapToDouble(Component::getPrice).sum();
    }
}
