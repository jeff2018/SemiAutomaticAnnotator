package plugin;



import plugin.ALMAPluginActivator;

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
