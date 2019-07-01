package plugin;



import plugin.ALMAPluginActivator;

/**
 * An entity class for aLMA plugin activators. It consists mostly of accessors
 * to the aLMA plugin activator's state.
 * <p>
 * It provides access to:
 * <ul>
 * <li>instance.</li>
 * </ul>
 */
public class ALMAPluginActivator {
	public static final String BASE_URL = "https://alma.uni.lu";
	
	private static ALMAPluginActivator instance;
	
	public ALMAPluginActivator() {
		ALMAPluginActivator.instance = this;

		//this.setEditorFallback();
	}
	
	public static ALMAPluginActivator getInstance() {
		return ALMAPluginActivator.instance;
	}
	
	
	
}
