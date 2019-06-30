package plugin;

import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.google.gson.Gson;

import plugin.ALMAPluginActivator;
import visitor.VisitorRegistry;
import plugin.ALMAConceptMapping.LabelNotFoundException;
import model.TreeObject;




public class ALMAConceptMappingFactory {
	
	public static final String JAVA = "java";
	public static final String C = "c";
	
	private Map<String, ALMAConceptMapping> schemeConceptMap;
	private Map<String, String> renamingMap;
	
	private static ALMAConceptMappingFactory instance;

	@SuppressWarnings("unchecked")
	private ALMAConceptMappingFactory() {
		ALMAConceptMappingFactory.instance = this;
		schemeConceptMap = new HashMap<>();
		renamingMap = new HashMap<>();
		
		try(InputStreamReader reader = new InputStreamReader(new URL(ALMAPluginActivator.BASE_URL + "/static/eclipse/renaming.json").openStream())){
			//System.out.println(reader);
			Map<String, List<Map<String,String>>> m = new Gson().fromJson(reader, Map.class);
			
			for(Map.Entry<String,List<Map<String,String>>> entry :m.entrySet()) {
				//System.out.println(entry.getKey()+"/"+entry.getValue());
			}
			for (String namespace : m.keySet()) {
				//System.out.println(namespace);
				List<Map<String,String>> renamingList = m.get(namespace);
				//System.out.println(renamingList);
				for(Map<String,String> renamingTuple : renamingList) {
					String oldURI = getURI(namespace,renamingTuple.get("ide"));
					String newURI = renamingTuple.get("concept");
					renamingMap.put(oldURI, newURI);
				}
;			}
			//System.out.println("renammingMap");
			//System.out.println(renamingMap);
			
		}catch(IOException e) {
			System.out.println(ALMAPluginActivator.BASE_URL + "/static/eclipse/renaming.json");

			System.out.println(e);
			
		}
	}
	
	public static ALMAConceptMappingFactory getInstance() {
		if (ALMAConceptMappingFactory.instance == null) {
			ALMAConceptMappingFactory.instance = new ALMAConceptMappingFactory();
		}
		return ALMAConceptMappingFactory.instance;
	}
	
	public void downloadSchemes() {
		schemeConceptMap.put(ALMAConceptMappingFactory.JAVA, downloadSchchemeDetails(ALMAConceptMappingFactory.JAVA));
		schemeConceptMap.put(ALMAConceptMappingFactory.C, downloadSchchemeDetails(ALMAConceptMappingFactory.C));

	}
	
	private ALMAConceptMapping downloadSchchemeDetails(String scheme) {
		String url = ALMAPluginActivator.BASE_URL + "/api/schemes/"+ scheme +"/";
		try {
			return ALMAConceptMapping.download(url);
		}  catch (MalformedURLException e) {
			//ALMAPluginActivator.getInstance().log("Error during download of " + scheme + " scheme: Malformed URL");
		} catch (IOException e) {
			//ALMAPluginActivator.getInstance().log("Error during download of " + scheme + " scheme: I/O Exception");
		}
		
		return null;
	}
	
	private String getURI(String namespace, String elementName) {
		return String.format("%s:%s", namespace, elementName);
	}
	
	public ALMAConceptMapping getSchemeDetails(String language) {
		return this.schemeConceptMap.get(language);
	}
	//Change back to treeobject
	public String getRenamedURI(String namespace, Class<?> nodeClass) {
		String originalURI = getURI(namespace, nodeClass.getSimpleName());
		//System.out.println("SimpleName "+ nodeClass.getSimpleName());
		//System.out.println(originalURI);
		try {
			//System.out.println(schemeConceptMap.get(namespace).getLabel(originalURI));
			schemeConceptMap.get(namespace).getLabel(originalURI);
			//System.out.println("1 "+originalURI);

			return originalURI;
			
		} catch (LabelNotFoundException e) {
			// TODO: handle exception
			List<Class<?>> hierarchy = new ArrayList<>();
			hierarchy.add(nodeClass);
			hierarchy.addAll(VisitorRegistry.getInheritanceList(nodeClass));
			
			for(Class<?> clazz :hierarchy) {
				//System.out.println("ClassSN "+ clazz.getSimpleName());

				String oldURI = this.getURI(namespace, clazz.getSimpleName());
				String newURI = this.renamingMap.get(oldURI);
				//System.out.println("old:"+oldURI+", new: "+newURI);
				if(newURI != null) {
					//System.out.println("2 "+newURI);
					/*try {
						System.out.println("New Label:" +schemeConceptMap.get(namespace).getLabel(newURI));
					} catch (LabelNotFoundException e1) {
						// TODO Auto-generated catch block
						e1.printStackTrace();
					}*/
					return newURI;
				}
			}
		} catch(NullPointerException e) {
			
			System.out.println(e);
			//return "Not found";
		}
		//System.out.println("3 "+originalURI);

		return originalURI;
	}
	
	public String getLabelTest(Object obj, String namespace) {
		//geet net weinst N
		
		return null;
	}
}
