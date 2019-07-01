package visitor;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * An object creator class for visitor registries. This class controls external
 * objects, i.e., the majority of its methods are controllers or object
 * creators.
 * <p>
 * It allows:
 * <ul>
 * <li>getting inheritance list.</li>
 * </ul>
 */
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
