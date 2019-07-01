package providers;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.eclipse.jdt.core.dom.ASTParser;
import org.eclipse.jdt.core.dom.CompilationUnit;

import model.TreeObject;
import model.TreeParent;

public abstract class AbstractContentProvider<N> {

	protected TreeParent<N> invisibleRoot;
	private N sourceRoot;
	private List<TreeObject<N>> treeObject;
	
	public AbstractContentProvider() {
		// TODO Auto-generated constructor stub
	}
	
	
	
	public List<TreeObject<N>> getTreeObject() {
		return treeObject;
	}



	public void setTreeObject(List<TreeObject<N>> treeObject) {
		this.treeObject = treeObject;
	}



	public TreeObject<N> createTreeObject(N node){
		
		List<N> children = getNodeChildren(node);
		
		if (children.size() == 0) {
			TreeObject<N> obj = new TreeObject<>(node);
			//System.out.println("Obj: "+obj.toString()+", "+ obj.getParent());
			return new TreeObject<>(node);
			
		} else {
			TreeParent<N> p = new TreeParent<>(node);
			//System.out.println("TP: "+p.toString());

			for(N child: children) {
				p.addChild(createTreeObject(child));
			}
			return p;
		}
		
	}
	
	public HashMap<TreeObject <N>,List<Integer>> getLines(List<TreeObject<N>> nodes){
		List<Integer> liness = new ArrayList<>();
		ArrayList<Integer> lines;
		HashMap<TreeObject<N>, List<Integer>> mapNodeLine = new HashMap<>();
		CompilationUnit root = (CompilationUnit) this.getSourceRoot();
		for(TreeObject<N> to:nodes) {
			int line = root.getLineNumber(getNodeOffset(to.getNode()));
			if(mapNodeLine.containsKey(to.getNode())) {
				lines = (ArrayList<Integer>) mapNodeLine.get(to);
				lines.add(line);
			}else {
				lines = new ArrayList<Integer>();
				lines.add(line);
				mapNodeLine.put(to, lines);

				
			}
			//System.out.println(to.getNode().getClass());
			
			
			//System.out.println(mapNodeLine);
			
		}
		return mapNodeLine;
	}
	
	public List<TreeObject<N>> createASTTree() {
		N sourceRoot = getSourceRoot();
		
		
		//System.out.println(sourceRoot.getClass());
		if(sourceRoot != null) {
			this.invisibleRoot = new TreeParent<>(null);
			this.invisibleRoot.addChild(this.createTreeObject(sourceRoot));
			//System.out.println("----getSubtree---");
			//System.out.println(invisibleRoot.getSubtree());
			
			
		}
		return invisibleRoot.getSubtree();
	}
	
	
	private N getSourceRoot() {
		if(this.sourceRoot == null) {
			this.sourceRoot = this.parse();
			
		}
		return this.sourceRoot;
	}
	
	
	public abstract int getNodeOffset(N node);

	protected abstract N parse();
	
	public abstract List<N> getNodeChildren(N node);
	
	
}
