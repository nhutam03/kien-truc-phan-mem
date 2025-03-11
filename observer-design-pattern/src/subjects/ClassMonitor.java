package subjects;

import java.util.ArrayList;
import java.util.List;

import observers.Observer;

public class ClassMonitor implements Subject {
	List<Observer> observers = new ArrayList<Observer>();

	@Override
	public void attach(Observer observer) {
		if (!observers.contains(observer)) {
			observers.add(observer);
		}
		
	}

	@Override
	public void detach(Observer observer) {
		if (observers.contains(observer)) {
			observers.remove(observer);
		}
		
	}

	@Override
	public void notification() {
		for (Observer observer : observers) {
            observer.update();
		}		
	}

}
