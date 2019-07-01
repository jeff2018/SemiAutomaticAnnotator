package model;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.eclipse.jdt.core.dom.ASTNode;

import model.TreeObject;


public class TreeObject<N> {
	private N node;
	private TreeParent<N> parent;
	
	public TreeObject(N node) {
		this.node=node;
	}
	public N getNode() {
		return node;
	}

	public void setNode(N node) {
		this.node = node;
	}

	public TreeParent<N> getParent() {
		return parent;
	}

	public void setParent(TreeParent<N> parent) {
		this.parent = parent;
	}

	@Override
	public String toString() {
		return (this.node != null) ? String.format("%s (%s)", this.node.getClass().getSimpleName(), this.node.toString()) : "";
	}
	
	public List<TreeObject<N>> getSubtree() {
		List<TreeObject<N>> l = new ArrayList<>();
		l.add(this);
		return l;
	}

	
	
	
	
}
