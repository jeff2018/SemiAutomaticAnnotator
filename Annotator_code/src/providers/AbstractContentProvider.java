package providers;

import java.util.List;


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
	
	public List<TreeObject<N>> createASTTree() {
		N sourceRoot = getSourceRoot();
		//System.out.println(sourceRoot);
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
	
	

	protected abstract N parse();
	
	public abstract List<N> getNodeChildren(N node);
	
	
}
