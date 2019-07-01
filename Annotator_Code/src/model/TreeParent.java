package model;

import java.util.ArrayList;
import java.util.List;

import org.eclipse.jdt.core.dom.ASTNode;

import model.TreeObject;

public class TreeParent<N> extends TreeObject<N> {
	
	private List<TreeObject<N>> children;
	
	public TreeParent(N node) {
		super(node);
		this.children = new ArrayList<>();
	}

	public void addChild(TreeObject<N> child) {
		this.children.add(child);
		child.setParent(this);
	}
	
	public TreeObject<N>[] getChildren() {
		return this.children.toArray(new TreeObject[this.children.size()]);
	}
	
	@Override
	public List<TreeObject<N>> getSubtree() {
		List<TreeObject<N>> subtree = super.getSubtree();

		for (TreeObject<N> child : this.children) {
			//System.out.println("Subtree: "+child.getNode().getClass().getSimpleName());

			subtree.addAll(child.getSubtree());
		}

		return subtree;
	}

}
