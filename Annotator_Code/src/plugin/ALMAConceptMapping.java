package plugin;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.google.gson.Gson;

import plugin.ALMAConceptMapping.LabelNotFoundException;

/**
 * A boundary class for aLMA concept mappings. It communicates with
 * {@link ALMAConceptMapping}, {@link MalformedURLException},
 * {@link IOException}, and other 4 classes.
 * <p>
 * It provides access to:
 * <ul>
 * <li>label.</li>
 * </ul>
 * <p>
 * It allows:
 * <ul>
 * <li>getting download.</li>
 * </ul>
 * <p>
 * This class declares the helper class {@link LabelNotFoundException}
 */
public class ALMAConceptMapping {
	
	private Map<String, String> uriLabelMap;
	
	
	
	public ALMAConceptMapping(String json) {
		this.uriLabelMap = new HashMap<>();
		
		Gson gson = new Gson();
		
		List<Map<String,String>> l = gson.fromJson(json, List.class);
		
		for(Map<String,String> _uriLabelMap : l) {
			this.uriLabelMap.put(_uriLabelMap.get("uri"), _uriLabelMap.get("label"));
		}
		//System.out.println("ACM uriLabelMapl:"+uriLabelMap);
		

	}



	public static ALMAConceptMapping download(String url) throws MalformedURLException, IOException{
		try(BufferedReader reader = new BufferedReader(new InputStreamReader(new URL(url).openStream()))) {
			String json = reader.readLine();
			//System.out.println(json);
			return new ALMAConceptMapping(json);
		}
	}
	
	/**
	 * A {@link Exception} extension for label not found exceptions. This class
	 * consists mostly of methods.
	 */
	@SuppressWarnings("serial")
	public static final class LabelNotFoundException extends Exception {
	}
	
	public String getLabel(String uri) throws LabelNotFoundException {
		//System.out.println("getlabel:"+uri);
		if (!this.uriLabelMap.containsKey(uri) || this.uriLabelMap.get(uri).equals("")) {
			//System.out.println("Exception !! getlabel:"+uri);

			throw new LabelNotFoundException();
		}
		//System.out.println("return getlabel:"+uriLabelMap.get(uri));
	
		return this.uriLabelMap.get(uri);
	}

}
