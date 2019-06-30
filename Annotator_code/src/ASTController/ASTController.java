package ASTController;

import java.util.ArrayList;
import java.util.List;

import org.eclipse.cdt.internal.core.dom.parser.cpp.CPPASTTranslationUnit;
import org.eclipse.jdt.core.dom.CompilationUnit;

import model.TreeObject;
import model.TreeParent;
import plugin.ALMAConceptMapping;
import plugin.ALMAConceptMappingFactory;


public class ASTController <N>
{
	ALMAConceptMappingFactory acmf = ALMAConceptMappingFactory.getInstance();
	List<String> treeList = new ArrayList<>();
	
	public List<String> conceptMapping(List<TreeObject<N>> astList, String namespace){
		System.out.println("---Downloading---");
		acmf.downloadSchemes();
		System.out.println("---conceptMapping---");
		
		List<String> conceptList = new ArrayList<>();
		astList.remove(0);
		for(TreeObject<N> to : astList) {
			
			String uri = acmf.getRenamedURI(namespace,to.getNode().getClass());
			//System.out.println("uri: "+uri);
			//System.out.println(to.getNode().getClass().getSimpleName()+" ---> "+uri);
			try {
				//System.out.println(to.getNode().getClass().getSimpleName()+" ---> "+getFinalLabel(to, namespace)+" ---> "+uri);

				//System.out.println(getLabelTest(to, namespace));
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			if(!conceptList.contains(uri)) {
				conceptList.add(uri);
			}
		}
		
		return conceptList;
		
	}
	
	public List<String> renamedURIList(List<TreeObject<N>> astList, String namespace){
		acmf.downloadSchemes();

		List<String> renamedURIList = new ArrayList<>();
		//astList.remove(0);
		for(TreeObject<N> to : astList) {
			String uri = acmf.getRenamedURI(namespace,to.getNode().getClass());
			//System.out.println("renameduriList uri: "+uri);

			renamedURIList.add(uri);
		}
		return renamedURIList;
	}
	public List<String> mappingList(List<TreeObject<N>> astList, List<String> renamedURIList, String namespace ){
		//acmf.downloadSchemes();

		List<String> mappingList = new ArrayList<>();
		int i = 0;
		for(TreeObject<N> to : astList) {
			String simpleName = to.getNode().getClass().getSimpleName();
			String label = getFinalLabel(to, namespace);
			String uri = renamedURIList.get(i);
			mappingList.add(simpleName+" ---> "+label+" ---> "+uri);
			i++;
		}
		
		return mappingList;
	}

	public List<String> conceptList(List<String> renamedURIList){
		List<String> conceptList = new ArrayList<>();
		for(String uri : renamedURIList) {
			if(!conceptList.contains(uri)) {
				conceptList.add(uri);
			}
		}
		return conceptList;
	}
	
	public String getFinalLabel(Object obj, String namespace) {
		N node = ((TreeObject<N>) obj).getNode();
		//System.out.println("Node:");
	//	System.out.println(node);
		if(node instanceof CompilationUnit) {
			/*System.out.println("True");
			ASTNode n = (ASTNode) node;
			System.out.println(n.getClass());
			System.out.println((CompilationUnit) n);
			System.out.println(((CompilationUnit) n).getClass());*/
			return node.getClass().getSimpleName();//((CompilationUnit) n).getJavaElement().toString();//.getJavaElement().getPath().lastSegment();
		
		}
		if(node instanceof CPPASTTranslationUnit) {
			//System.out.println("TRUE for"+ node);
			return node.getClass().getSimpleName();
		}
		else {
			String uri = acmf.getRenamedURI(namespace, node.getClass());
			ALMAConceptMapping almaMapping = acmf.getSchemeDetails(namespace);
			//System.out.println(almaMapping);
			if(almaMapping!=null) {
				try {
					//System.out.println("getFinalLabel "+uri);
					String label = almaMapping.getLabel(uri);
					return label;
				} catch (Exception e) {
					//System.out.println("Stacktreace getFinalLabel "+uri);

					e.printStackTrace();
				}
			}
			return String.format("%s (%s)", uri, node.getClass().getSimpleName());
		}
		
	}
	
	public void printTree(TreeObject<N>obj, String appender) {
		if (obj instanceof TreeParent) {
			TreeObject[] toList = ((TreeParent) obj).getChildren();
			try {
				//System.out.println(appender + ((TreeParent) obj).getNode().getClass().getSimpleName());

			} 
			catch (Exception e) {
				e.printStackTrace();
			}
			
			for (TreeObject to : toList) {
				printTree(to, appender + " ");

			}
		} 
		else {
			//System.out.println(appender + ((TreeObject) obj).getNode().getClass().getSimpleName());

		}
	}
	
	public List<String> treeList(TreeObject<N> obj, String appender){
		//System.out.println(obj);
		if (obj instanceof TreeParent) {
			TreeObject[] toList = ((TreeParent) obj).getChildren();
			try {
				treeList.add(appender + ((TreeParent) obj).getNode().getClass().getSimpleName());

			} 
			catch (Exception e) {
				e.printStackTrace();
			}
			
			for (TreeObject to : toList) {
				treeList(to, appender + " ");

			}
		} 
		else {
			treeList.add(appender + ((TreeObject) obj).getNode().getClass().getSimpleName());


		}
		return treeList;
	}

}
