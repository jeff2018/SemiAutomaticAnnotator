package visitor;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class VisitorRegistry {
	
	public static final List<Class<?>> getInheritanceList(Class<?> clazz){
		List<Class<?>> inheritanceList = new ArrayList<>();
		
		inheritanceList.addAll(Arrays.asList(clazz.getInterfaces()));
		
		for (Class<?> i :clazz.getInterfaces()) {
			inheritanceList.addAll(VisitorRegistry.getInheritanceList(i));
		}
		if(clazz.getSuperclass() != null) {
			inheritanceList.add(clazz.getSuperclass());
		}
		
		if(clazz.getSuperclass() != null) {
			inheritanceList.addAll(VisitorRegistry.getInheritanceList(clazz.getSuperclass()));
		}
		
		return inheritanceList;
	}

}
