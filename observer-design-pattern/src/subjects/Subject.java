package subjects;

import observers.Observer;

public interface Subject {
	void attach(Observer observer);
	void detach(Observer observer);
	void notification();
}
