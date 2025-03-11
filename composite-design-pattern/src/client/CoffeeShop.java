package client;

import java.util.ArrayList;
import java.util.List;

import composites.Table;

public class CoffeeShop {
	private List<Table> tables = new ArrayList<>();

    public void add(Table table) {
        tables.add(table);
    }

    public double getTotalRevenue() {
        return tables.stream().mapToDouble(Table::getPrice).sum();
    }
}
